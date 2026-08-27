using Server.Core.Common;
using Server.Features.HR.Entities;
using Server.Features.HR.Enums;
using Server.Features.HR.Models;

namespace Server.Features.HR.Repositories;

public interface IPayrollRepository
{
    Task<PagedResult<PayrollRunListItemResponse>> GetAllRunsAsync(int page, int pageSize);
    Task<PayrollRunResponse?> GetRunByIdAsync(Guid id);
    Task<PayrollRun?> GetRunEntityByIdAsync(Guid id);
    Task<bool> ExistsRunAsync(int year, int month);
    Task<bool> ExistsRunByIdAsync(Guid id);
    Task AddRunAsync(PayrollRun payrollRun);
    Task AddRangeDetailsAsync(IEnumerable<PayrollDetail> details);
    Task SoftDeleteRunAsync(Guid id, Guid userId);

    Task<List<PayrollDetailListItemResponse>> GetDetailsByRunIdAsync(Guid payrollRunId);
    Task<PayrollDetailResponse?> GetDetailByIdAsync(Guid id);
    Task<PayrollDetail?> GetDetailByIdWithRunAsync(Guid id);
}
