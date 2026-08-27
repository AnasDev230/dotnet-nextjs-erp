using Server.Core.Common;
using Server.Features.HR.Models;

namespace Server.Features.HR.Services;

public interface IPayrollService
{
    Task<PagedResult<PayrollRunListItemResponse>> GetAllRunsAsync(int page, int pageSize);
    Task<PayrollRunResponse> GetRunByIdAsync(Guid id);
    Task<List<PayrollDetailListItemResponse>> GetDetailsByRunIdAsync(Guid payrollRunId);
    Task<PayrollDetailResponse> GetDetailByIdAsync(Guid id);
    Task<PayrollRunResponse> CreatePayrollRunAsync(CreatePayrollRunRequest request);
    Task<PayrollRunResponse> MarkAsPaidAsync(Guid id);
    Task DeleteRunAsync(Guid id);
}
