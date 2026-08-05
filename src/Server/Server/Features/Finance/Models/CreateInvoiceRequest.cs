namespace Server.Features.Finance.Models;

public class CreateInvoiceRequest
{
    public Guid OrderId { get; set; }
    public DateOnly IssueDate { get; set; }
}
