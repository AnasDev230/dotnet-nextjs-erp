using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;

namespace Server.Features.HR.Repositories;

public interface ILeaveRequestRepository
{
    Task<PagedResult<LeaveRequestListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, LeaveStatus? status, LeaveType? leaveType,
        DateTime? dateFrom, DateTime? dateTo);

    Task<LeaveRequestResponse?> GetByIdAsync(Guid id);
    Task<LeaveRequest?> GetEntityByIdAsync(Guid id);
    Task<bool> ExistsByIdAsync(Guid id);
    Task<bool> HasOverlappingAsync(Guid employeeId, DateTime startDate, DateTime endDate, Guid? excludeId);
    Task<LeaveSummaryResponse> GetYearSummaryAsync(Guid employeeId, int year);
    Task AddAsync(LeaveRequest leaveRequest);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
