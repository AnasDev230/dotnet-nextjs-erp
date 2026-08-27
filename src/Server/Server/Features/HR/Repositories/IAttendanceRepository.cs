using Server.Core.Common;
using Server.Features.HR.Enums;
using Server.Features.HR.Entities;
using Server.Features.HR.Models;

namespace Server.Features.HR.Repositories;

public interface IAttendanceRepository
{
    Task<PagedResult<AttendanceListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, DateTime? date, AttendanceStatus? status,
        DateTime? dateFrom, DateTime? dateTo);

    Task<AttendanceResponse?> GetByIdAsync(Guid id);
    Task<Attendance?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsAsync(Guid employeeId, DateTime date);
    Task<bool> ExistsByIdAsync(Guid id);
    Task AddAsync(Attendance attendance);
    Task AddRangeAsync(IEnumerable<Attendance> attendances);
    Task SoftDeleteAsync(Guid id, Guid userId);
    Task<AttendanceSummaryResponse> GetMonthlySummaryAsync(Guid employeeId, int year, int month);
    Task<List<Attendance>> GetByEmployeeAndMonthAsync(Guid employeeId, int year, int month);
}
