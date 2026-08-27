using Microsoft.EntityFrameworkCore;
using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;
using Server.Infrastructure.Persistence;

namespace Server.Features.HR.Repositories;

public class PayrollRepository : IPayrollRepository
{
    private readonly AppDbContext _context;

    public PayrollRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PayrollRunListItemResponse>> GetAllRunsAsync(int page, int pageSize)
    {
        var query = _context.PayrollRuns
            .AsNoTracking()
            .AsQueryable();

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.Year)
            .ThenByDescending(r => r.Month)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new PayrollRunListItemResponse
            {
                Id = r.Id,
                RunNumber = r.RunNumber,
                Month = r.Month,
                Year = r.Year,
                Status = r.Status,
                TotalNetAmount = r.TotalNetAmount,
                EmployeeCount = r.EmployeeCount,
                ProcessedAt = r.ProcessedAt,
                PaidAt = r.PaidAt,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<PayrollRunListItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PayrollRunResponse?> GetRunByIdAsync(Guid id)
    {
        return await _context.PayrollRuns
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new PayrollRunResponse
            {
                Id = r.Id,
                RunNumber = r.RunNumber,
                Month = r.Month,
                Year = r.Year,
                Status = r.Status,
                TotalNetAmount = r.TotalNetAmount,
                EmployeeCount = r.EmployeeCount,
                ProcessedAt = r.ProcessedAt,
                PaidAt = r.PaidAt,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PayrollRun?> GetRunEntityByIdAsync(Guid id)
        => await _context.PayrollRuns.FirstOrDefaultAsync(r => r.Id == id);

    public async Task<bool> ExistsRunAsync(int year, int month)
        => await _context.PayrollRuns.AnyAsync(r => r.Year == year && r.Month == month);

    public async Task<bool> ExistsRunByIdAsync(Guid id)
        => await _context.PayrollRuns.AnyAsync(r => r.Id == id);

    public async Task AddRunAsync(PayrollRun payrollRun)
        => await _context.PayrollRuns.AddAsync(payrollRun);

    public async Task AddRangeDetailsAsync(IEnumerable<PayrollDetail> details)
        => await _context.PayrollDetails.AddRangeAsync(details);

    public async Task SoftDeleteRunAsync(Guid id, Guid userId)
    {
        var run = await _context.PayrollRuns.FirstOrDefaultAsync(r => r.Id == id);
        if (run is not null)
        {
            run.DeletedAt = DateTime.UtcNow;
            run.UpdatedBy = userId;
        }
    }

    public async Task<List<PayrollDetailListItemResponse>> GetDetailsByRunIdAsync(Guid payrollRunId)
    {
        return await _context.PayrollDetails
            .AsNoTracking()
            .Include(d => d.Employee)
            .Where(d => d.PayrollRunId == payrollRunId)
            .OrderBy(d => d.Employee!.FirstName)
            .Select(d => new PayrollDetailListItemResponse
            {
                Id = d.Id,
                EmployeeId = d.EmployeeId,
                EmployeeName = d.Employee!.FirstName + " " + d.Employee.LastName,
                EmployeeNumber = d.Employee.EmployeeNumber,
                BaseSalary = d.BaseSalary,
                TotalEarnings = d.TotalEarnings,
                TotalDeductions = d.TotalDeductions,
                NetPay = d.NetPay,
                PresentDays = d.PresentDays,
                LateDays = d.LateDays,
                AbsentDays = d.AbsentDays
            })
            .ToListAsync();
    }

    public async Task<PayrollDetailResponse?> GetDetailByIdAsync(Guid id)
    {
        return await _context.PayrollDetails
            .AsNoTracking()
            .Include(d => d.Employee)
            .Where(d => d.Id == id)
            .Select(d => new PayrollDetailResponse
            {
                Id = d.Id,
                EmployeeId = d.EmployeeId,
                EmployeeName = d.Employee!.FirstName + " " + d.Employee.LastName,
                EmployeeNumber = d.Employee.EmployeeNumber,
                BaseSalary = d.BaseSalary,
                TransportAllowance = d.TransportAllowance,
                HousingAllowance = d.HousingAllowance,
                OvertimePay = d.OvertimePay,
                OtherAllowances = d.OtherAllowances,
                TotalEarnings = d.TotalEarnings,
                LateDeduction = d.LateDeduction,
                AbsentDeduction = d.AbsentDeduction,
                InsuranceDeduction = d.InsuranceDeduction,
                OtherDeductions = d.OtherDeductions,
                TotalDeductions = d.TotalDeductions,
                NetPay = d.NetPay,
                PresentDays = d.PresentDays,
                LateDays = d.LateDays,
                AbsentDays = d.AbsentDays,
                OvertimeHours = d.OvertimeHours,
                Notes = d.Notes
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PayrollDetail?> GetDetailByIdWithRunAsync(Guid id)
        => await _context.PayrollDetails
            .Include(d => d.PayrollRun)
            .FirstOrDefaultAsync(d => d.Id == id);
}
