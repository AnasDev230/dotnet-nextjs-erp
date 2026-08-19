using Server.Core.Common;
using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Purchasing.Models;

namespace Server.Features.Purchasing.Repositories;

public interface ISupplierInvoiceRepository
{
    Task<PagedResult<SupplierInvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, SupplierInvoiceStatus? status, Guid? supplierId);
    Task<SupplierInvoiceResponse?> GetByIdAsync(Guid id);
    Task<SupplierInvoice?> GetEntityByIdAsync(Guid id);
    Task<string> GenerateInvoiceNumberAsync();
    Task AddAsync(SupplierInvoice invoice);
    Task<bool> HasInvoiceForPurchaseOrderAsync(Guid purchaseOrderId, Guid? excludeId = null);
    Task SoftDeleteAsync(Guid id, Guid userId);
}