using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Core.Exceptions;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Features.HR.Repositories;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Services;

public class PayrollService : IPayrollService
{
    private const int StandardWorkingDaysPerMonth = 30;
    private const int StandardWorkingHoursPerDay = 8;
    private const decimal OvertimeMultiplier = 1.5m;
    private const decimal LateDeductionRate = 0.10m;
    private const decimal InsuranceRate = 0.10m;

    private readonly IPayrollRepository _repository;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PayrollService(
        IPayrollRepository repository,
        IAttendanceRepository attendanceRepository,
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _attendanceRepository = attendanceRepository;
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PayrollRunListItemResponse>> GetAllRunsAsync(int page, int pageSize)
        => await _repository.GetAllRunsAsync(page, pageSize);

    public async Task<PayrollRunResponse> GetRunByIdAsync(Guid id)
    {
        var run = await _repository.GetRunByIdAsync(id);
        if (run is null) throw new NotFoundException(nameof(PayrollRun), id);
        return run;
    }

    public async Task<List<PayrollDetailListItemResponse>> GetDetailsByRunIdAsync(Guid payrollRunId)
    {
        if (!await _repository.ExistsRunByIdAsync(payrollRunId))
            throw new NotFoundException(nameof(PayrollRun), payrollRunId);

        return await _repository.GetDetailsByRunIdAsync(payrollRunId);
    }

    public async Task<PayrollDetailResponse> GetDetailByIdAsync(Guid id)
    {
        var detail = await _repository.GetDetailByIdAsync(id);
        if (detail is null) throw new NotFoundException(nameof(PayrollDetail), id);
        return detail;
    }

    public async Task<PayrollRunResponse> CreatePayrollRunAsync(CreatePayrollRunRequest request)
    {
        // 1. Validate month/year
        if (request.Month < 1 || request.Month > 12)
            throw new BusinessException("الشهر يجب أن يكون بين 1 و 12.");

        if (request.Year < 2000 || request.Year > 2100)
            throw new BusinessException("السنة غير صحيحة.");

        // 2. Validate no existing run for same Year + Month
        if (await _repository.ExistsRunAsync(request.Year, request.Month))
            throw new BusinessException("يوجد مسير رواتب مسبق لهذا الشهر والسنة.");

        // 3. Get all Active employees
        var activeEmployees = await _context.Employees
            .AsNoTracking()
            .Where(e => e.Status == EmployeeStatus.Active)
            .ToListAsync();

        if (activeEmployees.Count == 0)
            throw new BusinessException("لا يوجد موظفين نشطين لإنشاء مسير الرواتب.");

        // 4. Create the PayrollRun first
        var payrollRun = new PayrollRun
        {
            RunNumber = $"PAY-{request.Year}-{request.Month:D2}",
            Month = request.Month,
            Year = request.Year,
            Status = PayrollStatus.Processing,
            Notes = request.Notes,
            ProcessedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.UserId
        };

        await _repository.AddRunAsync(payrollRun);
        await _context.SaveChangesAsync();

        // 5. For each employee, calculate payroll
        var details = new List<PayrollDetail>();

        foreach (var emp in activeEmployees)
        {
            var attendanceSummary = await _attendanceRepository.GetMonthlySummaryAsync(
                emp.Id, request.Year, request.Month);

            // a. Base salary
            var baseSalary = emp.Salary;

            // b. Allowances (defaults - will be expanded later)
            var transportAllowance = 0m;
            var housingAllowance = 0m;
            var otherAllowances = 0m;

            // c. Overtime pay = OvertimeHours × (dailyRate / 8 × 1.5)
            var dailyRate = baseSalary / StandardWorkingDaysPerMonth;
            var hourlyRate = dailyRate / StandardWorkingHoursPerDay;
            var overtimePay = Math.Round(
                attendanceSummary.TotalOvertimeHours * hourlyRate * OvertimeMultiplier, 2);

            // d. Late deduction = lateDays × (dailyRate × 10%)
            var lateDeduction = Math.Round(
                attendanceSummary.LateDays * dailyRate * LateDeductionRate, 2);

            // e. Absent deduction = absentDays × dailyRate
            var absentDeduction = Math.Round(
                attendanceSummary.AbsentDays * dailyRate, 2);

            // f. Insurance = 10% of base salary
            var insuranceDeduction = Math.Round(baseSalary * InsuranceRate, 2);

            // g. Totals
            var totalEarnings = baseSalary + transportAllowance + housingAllowance + overtimePay + otherAllowances;
            var totalDeductions = lateDeduction + absentDeduction + insuranceDeduction;
            var netPay = totalEarnings - totalDeductions;

            var detail = new PayrollDetail
            {
                PayrollRunId = payrollRun.Id,
                EmployeeId = emp.Id,
                BaseSalary = baseSalary,
                TransportAllowance = transportAllowance,
                HousingAllowance = housingAllowance,
                OvertimePay = overtimePay,
                OtherAllowances = otherAllowances,
                TotalEarnings = totalEarnings,
                LateDeduction = lateDeduction,
                AbsentDeduction = absentDeduction,
                InsuranceDeduction = insuranceDeduction,
                OtherDeductions = 0m,
                TotalDeductions = totalDeductions,
                NetPay = netPay,
                PresentDays = attendanceSummary.PresentDays,
                LateDays = attendanceSummary.LateDays,
                AbsentDays = attendanceSummary.AbsentDays,
                OvertimeHours = attendanceSummary.TotalOvertimeHours,
                CreatedBy = _currentUserService.UserId
            };

            details.Add(detail);
        }

        // 6. Save all details
        await _repository.AddRangeDetailsAsync(details);

        // 7. Update PayrollRun totals
        payrollRun.TotalNetAmount = details.Sum(d => d.NetPay);
        payrollRun.EmployeeCount = details.Count;
        payrollRun.Status = PayrollStatus.Completed;
        payrollRun.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetRunByIdAsync(payrollRun.Id);
    }

    public async Task<PayrollRunResponse> MarkAsPaidAsync(Guid id)
    {
        var run = await _repository.GetRunEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(PayrollRun), id);

        if (run.Status != PayrollStatus.Completed)
            throw new BusinessException("يمكن تحديد المسير كمدفوع فقط إذا كان مكتملاً.");

        run.Status = PayrollStatus.Paid;
        run.PaidAt = DateTime.UtcNow;
        run.UpdatedBy = _currentUserService.UserId;

        await _context.SaveChangesAsync();

        return await GetRunByIdAsync(id);
    }

    public async Task DeleteRunAsync(Guid id)
    {
        var run = await _repository.GetRunEntityByIdAsync(id)
            ?? throw new NotFoundException(nameof(PayrollRun), id);

        if (run.Status is not (PayrollStatus.Draft or PayrollStatus.Processing))
            throw new BusinessException("لا يمكن حذف مسير الرواتب إلا إذا كان مسودة أو قيد المعالجة.");

        await _repository.SoftDeleteRunAsync(id, _currentUserService.UserId!.Value);
        await _context.SaveChangesAsync();
    }
}
