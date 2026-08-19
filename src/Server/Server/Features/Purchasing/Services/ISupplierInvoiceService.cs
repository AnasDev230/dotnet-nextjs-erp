using Server.Core.Common;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Services;

public interface ISupplierInvoiceService
{
    Task<PagedResult<SupplierInvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, SupplierInvoiceStatus? status, Guid? supplierId);
    Task<SupplierInvoiceResponse> GetByIdAsync(Guid id);
    Task<SupplierInvoiceResponse> CreateAsync(CreateSupplierInvoiceRequest request);
    Task<SupplierInvoiceResponse> UpdateAsync(Guid id, UpdateSupplierInvoiceRequest request);
    Task ReceiveAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
}