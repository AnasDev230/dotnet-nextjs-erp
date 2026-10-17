using Server.Core.Common;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;

namespace Server.Features.HR.Services;

public interface ILeaveRequestService
{
    Task<PagedResult<LeaveRequestListItemResponse>> GetAllAsync(
        int page, int pageSize,
        Guid? employeeId, LeaveStatus? status, LeaveType? leaveType,
        DateTime? dateFrom, DateTime? dateTo);

    Task<LeaveRequestResponse> GetByIdAsync(Guid id);
    Task<LeaveRequestResponse> CreateAsync(CreateLeaveRequestRequest request);
    Task<LeaveRequestResponse> UpdateAsync(Guid id, UpdateLeaveRequestRequest request);
    Task<LeaveRequestResponse> ApproveAsync(Guid id);
    Task<LeaveRequestResponse> RejectAsync(Guid id, RejectLeaveRequestRequest request);
    Task<LeaveRequestResponse> CancelAsync(Guid id, CancelLeaveRequestRequest? request);
    Task DeleteAsync(Guid id);
    Task<LeaveSummaryResponse> GetYearSummaryAsync(Guid employeeId, int year);
}
