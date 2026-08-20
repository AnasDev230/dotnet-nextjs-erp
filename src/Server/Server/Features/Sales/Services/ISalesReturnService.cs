using Server.Core.Common;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Services;

public interface ISalesReturnService
{
    Task<PagedResult<SalesReturnListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, ReturnStatus? status,
        DateTime? fromDate, DateTime? toDate);
    Task<SalesReturnResponse> GetByIdAsync(Guid id);
    Task<SalesReturnResponse> CreateAsync(CreateSalesReturnRequest request);
    Task SubmitAsync(Guid id);
    Task ApproveAsync(Guid id);
    Task CompleteAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
}