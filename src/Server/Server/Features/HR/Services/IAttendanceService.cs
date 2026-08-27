using Server.Core.Common;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;

namespace Server.Features.HR.Services;

public interface IAttendanceService
{
    Task<PagedResult<AttendanceListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, DateTime? date, AttendanceStatus? status,
        DateTime? dateFrom, DateTime? dateTo);

    Task<AttendanceResponse> GetByIdAsync(Guid id);
    Task<AttendanceResponse> CreateAsync(CreateAttendanceRequest request);
    Task<List<AttendanceResponse>> BulkCreateAsync(BulkAttendanceRequest request);
    Task<AttendanceResponse> UpdateAsync(Guid id, UpdateAttendanceRequest request);
    Task DeleteAsync(Guid id);
    Task<AttendanceSummaryResponse> GetMonthlySummaryAsync(Guid employeeId, int year, int month);
}
