namespace Server.Features.Reports.Models;

public class ReportQueryParams
{
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public Guid? EntityId { get; set; }
}