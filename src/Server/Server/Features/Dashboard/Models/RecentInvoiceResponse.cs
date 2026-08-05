using Server.Features.Finance;
using Server.Features.Finance.Enums;

namespace Server.Features.Dashboard.Models;

public class RecentInvoiceResponse
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateOnly IssueDate { get; set; }
    public decimal NetAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public InvoiceStatus Status { get; set; }
    public bool IsOverdue { get; set; }
}
