using Server.Features.HR.Entities;
using Server.Features.HR.Enums;

namespace Server.Infrastructure.Persistence.DemoData;

public partial class DemoDataSeeder
{
    private void SeedDepartments()
    {
        for (var i = 0; i < DemoDataCatalog.DepartmentNames.Length; i++)
        {
            var department = new Department
            {
                Code = $"DEP-{(i + 1).ToString().PadLeft(3, '0')}",
                Name = DemoDataCatalog.DepartmentNames[i],
                Description = $"{DemoDataCatalog.DepartmentNames[i]} department.",
                IsActive = true,
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(300, 400))
            };
            _departments.Add(department);
            _context.Departments.Add(department);
        }
    }

    private void SeedEmployees()
    {
        for (var i = 0; i < 50; i++)
        {
            _empCounter++;
            var first = Pick(DemoDataCatalog.FirstNames);
            var last = Pick(DemoDataCatalog.LastNames);
            var department = Pick(_departments);

            _employees.Add(new Employee
            {
                EmployeeNumber = NewCode("EMP", _empCounter),
                FirstName = first,
                LastName = last,
                Email = $"{first.ToLower()}.{last.ToLower()}{_empCounter}@bunyan.com",
                Phone = $"+966 5{Int(0, 10)}{Int(1000000, 9999999)}",
                HireDate = DateOnlyBefore(1400, 30),
                DepartmentId = department.Id,
                JobTitle = Pick(DemoDataCatalog.JobTitles),
                EmploymentType = Pick(new[]
                {
                    EmploymentType.FullTime, EmploymentType.FullTime, EmploymentType.FullTime,
                    EmploymentType.PartTime, EmploymentType.Contract, EmploymentType.Intern
                }),
                Salary = Money(4000, 32000),
                Currency = "SAR",
                Status = Chance(88) ? EmployeeStatus.Active
                    : Chance(50) ? EmployeeStatus.OnLeave : EmployeeStatus.Terminated,
                Notes = null,
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(60, 400))
            });
        }

        _context.Employees.AddRange(_employees);
    }

    private void LinkDepartmentManagers()
    {
        foreach (var department in _departments)
        {
            var members = _employees.Where(e => e.DepartmentId == department.Id).ToList();
            if (members.Count == 0) continue;

            var manager = members[0];
            department.ManagerId = manager.Id;
            manager.JobTitle = $"{department.Name} Manager";

            foreach (var member in members.Skip(1))
                member.ManagerId = manager.Id;
        }
    }

    private void SeedAttendance()
    {
        var records = new List<Attendance>();

        foreach (var employee in _employees)
        {
            if (employee.Status == EmployeeStatus.Terminated)
                continue;

            for (var offset = 1; offset <= 60; offset++)
            {
                var date = _now.Date.AddDays(-offset);
                if (date.DayOfWeek is DayOfWeek.Friday or DayOfWeek.Saturday)
                    continue;

                var status = PickAttendanceStatus();
                var checkIn = TimeSpan.FromHours(8) + TimeSpan.FromMinutes(Int(-10, 45));
                var checkOut = TimeSpan.FromHours(17) + TimeSpan.FromMinutes(Int(-20, 60));
                decimal? workHours = status switch
                {
                    AttendanceStatus.Absent or AttendanceStatus.Leave => null,
                    AttendanceStatus.HalfDay => 4m,
                    _ => Math.Round((decimal)(checkOut - checkIn).TotalHours - 1m, 2)
                };

                records.Add(new Attendance
                {
                    EmployeeId = employee.Id,
                    Date = date,
                    CheckIn = status is AttendanceStatus.Absent or AttendanceStatus.Leave ? null : checkIn,
                    CheckOut = status is AttendanceStatus.Absent or AttendanceStatus.Leave ? null : checkOut,
                    WorkHours = workHours,
                    OvertimeHours = status == AttendanceStatus.Present && Chance(20) ? Int(1, 4) : 0,
                    BreakMinutes = 60,
                    Status = status,
                    Notes = status switch
                    {
                        AttendanceStatus.Late => "Late arrival",
                        AttendanceStatus.Absent => "Unexcused absence",
                        AttendanceStatus.Leave => "Approved leave",
                        _ => null
                    },
                    RecordedBy = OwnerId,
                    CreatedBy = OwnerId,
                    CreatedAt = date
                });
            }
        }

        _context.AttendanceRecords.AddRange(records);
    }

    private AttendanceStatus PickAttendanceStatus()
    {
        var roll = Int(0, 100);
        return roll switch
        {
            < 82 => AttendanceStatus.Present,
            < 90 => AttendanceStatus.Late,
            < 94 => AttendanceStatus.Absent,
            < 98 => AttendanceStatus.Leave,
            _ => AttendanceStatus.HalfDay
        };
    }

    private void SeedPayroll()
    {
        for (var monthsAgo = 6; monthsAgo >= 1; monthsAgo--)
        {
            var reference = _now.AddMonths(-monthsAgo);
            var status = monthsAgo == 1
                ? (Chance(50) ? PayrollStatus.Completed : PayrollStatus.Processing)
                : PayrollStatus.Paid;

            var run = new PayrollRun
            {
                RunNumber = $"PAY-{reference.Year}-{reference.Month.ToString().PadLeft(2, '0')}",
                Month = reference.Month,
                Year = reference.Year,
                Status = status,
                ProcessedAt = reference.AddDays(1),
                PaidAt = status == PayrollStatus.Paid ? reference.AddDays(3) : null,
                Notes = $"Payroll run for {reference:MMMM yyyy}.",
                CreatedBy = OwnerId,
                CreatedAt = reference.AddDays(-2)
            };

            var details = new List<PayrollDetail>();
            decimal total = 0;

            foreach (var employee in _employees.Where(e => e.Status != EmployeeStatus.Terminated))
            {
                var baseSalary = employee.Salary;
                var transport = Math.Round(baseSalary * 0.10m, 2);
                var housing = Math.Round(baseSalary * 0.25m, 2);
                var overtimeHours = Int(0, 20);
                var overtimePay = Math.Round(baseSalary / 240m * overtimeHours * 1.5m, 2);
                var other = Math.Round(Money(0, 500), 2);
                var earnings = baseSalary + transport + housing + overtimePay + other;

                var presentDays = Int(18, 23);
                var lateDays = Int(0, 4);
                var absentDays = Int(0, 2);
                var lateDeduction = Math.Round(baseSalary / 240m * lateDays * 0.5m, 2);
                var absentDeduction = Math.Round(baseSalary / 30m * absentDays, 2);
                var insurance = Math.Round(baseSalary * 0.02m, 2);
                var otherDeductions = Math.Round(Money(0, 300), 2);
                var deductions = lateDeduction + absentDeduction + insurance + otherDeductions;
                var net = earnings - deductions;
                total += net;

                details.Add(new PayrollDetail
                {
                    PayrollRunId = run.Id,
                    EmployeeId = employee.Id,
                    BaseSalary = baseSalary,
                    TransportAllowance = transport,
                    HousingAllowance = housing,
                    OvertimePay = overtimePay,
                    OtherAllowances = other,
                    TotalEarnings = earnings,
                    LateDeduction = lateDeduction,
                    AbsentDeduction = absentDeduction,
                    InsuranceDeduction = insurance,
                    OtherDeductions = otherDeductions,
                    TotalDeductions = deductions,
                    NetPay = net,
                    PresentDays = presentDays,
                    LateDays = lateDays,
                    AbsentDays = absentDays,
                    OvertimeHours = overtimeHours,
                    CreatedBy = OwnerId,
                    CreatedAt = run.CreatedAt
                });
            }

            run.TotalNetAmount = Math.Round(total, 2);
            run.EmployeeCount = details.Count;
            run.Details = details;
            _context.PayrollRuns.Add(run);
        }
    }
}
