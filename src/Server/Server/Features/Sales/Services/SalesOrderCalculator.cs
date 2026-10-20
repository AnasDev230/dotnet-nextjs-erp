namespace Server.Features.Sales.Services;

internal static class SalesOrderCalculator
{
    public static decimal CalculateLineTotals(SalesOrder order)
    {
        foreach (var item in order.Items)
        {
            var lineGross = item.Quantity * item.UnitPrice;
            var lineDiscount = lineGross * (item.DiscountPct / 100m);
            item.LineTotal = Math.Round(lineGross - lineDiscount, 2, MidpointRounding.AwayFromZero);
        }

        return order.Items.Sum(i => i.LineTotal);
    }

    public static void Calculate(SalesOrder order, decimal taxPct)
    {
        var subtotal = CalculateLineTotals(order);

        order.DiscountAmount = Math.Round(subtotal * (order.DiscountPct / 100m), 2, MidpointRounding.AwayFromZero);

        var taxableAmount = subtotal - order.DiscountAmount;

        order.TaxPct = taxPct;
        order.TaxAmount = Math.Round(taxableAmount * (taxPct / 100m), 2, MidpointRounding.AwayFromZero);
        order.NetAmount = taxableAmount + order.TaxAmount;
        order.TotalAmount = order.NetAmount;
    }
}
