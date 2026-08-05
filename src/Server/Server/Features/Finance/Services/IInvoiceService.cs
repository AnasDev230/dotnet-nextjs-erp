using Server.Core.Common;
using Server.Features.Finance.Models;

namespace Server.Features.Finance.Services;

public interface IInvoiceService
{
    Task<PagedResult<InvoiceListItemResponse>> GetAllAsync(
        int page, int pageSize, string? searchTerm,
        Guid? customerId, InvoiceStatus? status,
        DateOnly? fromDate, DateOnly? toDate);
    Task<InvoiceResponse> GetByIdAsync(Guid id);
    Task<InvoiceResponse> CreateAsync(CreateInvoiceRequest request);
    Task<InvoiceResponse> IssueAsync(Guid id);
    Task<InvoiceResponse> CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
}
