using Server.Core.Common;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Services;

public interface IQuotationService
{
    Task<PagedResult<QuotationListItemResponse>> GetAllAsync(
        int page, int pageSize, QuotationStatus? status = null, Guid? customerId = null);

    Task<QuotationResponse> GetByIdAsync(Guid id);
    Task<QuotationResponse> CreateAsync(CreateQuotationRequest request);
    Task<QuotationResponse> UpdateAsync(Guid id, UpdateQuotationRequest request);
    Task SendAsync(Guid id);
    Task AcceptAsync(Guid id);
    Task RejectAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
    Task<Guid> ConvertToSalesOrderAsync(Guid id, Guid? warehouseId = null);
}
