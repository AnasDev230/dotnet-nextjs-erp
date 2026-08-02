namespace Server.Features.Sales;

public enum SalesOrderStatus
{
    Draft = 0,       // مسودة — can be edited
    Confirmed = 1,   // مؤكد — cannot be edited (future: triggers reservation)
    Cancelled = 2    // ملغي
}
