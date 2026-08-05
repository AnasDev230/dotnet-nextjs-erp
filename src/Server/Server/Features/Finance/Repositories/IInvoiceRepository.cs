using Server.Core.Common;
using Server.Features.Finance.Models;

namespace Server.Features.Finance.Repositories;

public interface IInvoiceRepository
{
    Task<PagedResult<InvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, InvoiceStatus? status,
        DateOnly? fromDate, DateOnly? toDate);
    Task<Invoice?> GetByIdAsync(Guid id);
    Task<Invoice?> GetByOrderIdAsync(Guid orderId);
    Task<Invoice?> GetEntityByIdAsync(Guid id);
    Task<string> GenerateInvoiceNumberAsync();
    Task AddAsync(Invoice invoice);
    Task SoftDeleteAsync(Guid id, Guid userId);
}
