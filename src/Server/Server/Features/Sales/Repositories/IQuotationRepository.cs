using Server.Core.Common;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;
using Server.Features.Sales.Models;

namespace Server.Features.Sales.Repositories;

public interface IQuotationRepository
{
    Task<PagedResult<QuotationListItemResponse>> GetAllAsync(
        int page, int pageSize, QuotationStatus? status = null, Guid? customerId = null);

    Task<Quotation?> GetByIdAsync(Guid id);
    Task<Quotation?> GetEntityByIdAsync(Guid id);
    Task AddAsync(Quotation quotation);
    Task SoftDeleteAsync(Guid id, Guid userId);
    Task HardDeleteAsync(Guid id);
    Task<string> GenerateQuotationNumberAsync();
    Task MarkExpiredAsync();
}
