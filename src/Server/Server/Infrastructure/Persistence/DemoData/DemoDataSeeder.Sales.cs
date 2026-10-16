using Server.Features.Finance;
using Server.Features.Finance.Enums;
using Server.Features.Sales;
using Server.Features.Sales.Entities;
using Server.Features.Sales.Enums;

namespace Server.Infrastructure.Persistence.DemoData;

public partial class DemoDataSeeder
{
    private readonly List<Invoice> _invoices = new();

    private void SeedSalesAsync()
    {
        SeedCustomers();
        SeedSalesOrders();
        SeedInvoices();
        SeedQuotations();
        SeedSalesReturns();
    }

    private void SeedCustomers()
    {
        for (var i = 0; i < 100; i++)
        {
            _custCounter++;
            var isCompany = Chance(65);
            var first = Pick(DemoDataCatalog.FirstNames);
            var last = Pick(DemoDataCatalog.LastNames);

            _customers.Add(new Customer
            {
                Code = NewCode("CUS", _custCounter),
                Name = isCompany
                    ? $"{Pick(DemoDataCatalog.CustomerPrefixes)} {Pick(DemoDataCatalog.CompanySuffixes)}"
                    : $"{first} {last}",
                Type = isCompany ? CustomerType.Company : CustomerType.Individual,
                TaxNumber = isCompany ? Int(300000000, 399999999).ToString() : null,
                CreditLimit = isCompany ? Money(50000, 500000) : Money(5000, 50000),
                PaymentTerms = Pick(new[] { 15, 30, 45, 60 }),
                Status = Chance(92) ? CustomerStatus.Active : CustomerStatus.Suspended,
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(30, 360))
            });
        }

        _context.Customers.AddRange(_customers);
    }

    private void SeedSalesOrders()
    {
        for (var i = 0; i < 350; i++)
        {
            _soCounter++;
            var customer = Pick(_customers);
            var warehouse = Pick(_warehouses);
            var orderDate = DateOnlyBefore(300, 1);
            var roll = Int(0, 100);
            var status = roll < 15
                ? SalesOrderStatus.Draft
                : roll < 92
                    ? SalesOrderStatus.Confirmed
                    : SalesOrderStatus.Cancelled;

            var order = new SalesOrder
            {
                OrderNumber = NewDocNumber("SO", _soCounter),
                CustomerId = customer.Id,
                WarehouseId = warehouse.Id,
                OrderDate = orderDate,
                DeliveryDate = orderDate.AddDays(Int(2, 21)),
                Status = status,
                Notes = status == SalesOrderStatus.Cancelled ? "Cancelled by customer request." : null,
                CreatedBy = OwnerId,
                CreatedAt = orderDate.ToDateTime(TimeOnly.MinValue)
            };

            var items = new List<SalesOrderItem>();
            decimal total = 0;
            var productCount = Int(1, 7);

            foreach (var product in _products.OrderBy(_ => _rnd.Next()).Take(productCount))
            {
                var quantity = Qty(1, 60);
                var unitPrice = Math.Round(product.SalePrice * Money(0.95m, 1.05m), 2);
                var discountPct = Pick(new[] { 0m, 0m, 5m, 10m });
                var lineTotal = Math.Round(quantity * unitPrice * (1 - discountPct / 100m), 2);
                total += lineTotal;

                items.Add(new SalesOrderItem
                {
                    OrderId = order.Id,
                    ProductId = product.Id,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    DiscountPct = discountPct,
                    LineTotal = lineTotal,
                    CreatedBy = OwnerId,
                    CreatedAt = order.CreatedAt
                });
            }

            order.TotalAmount = Math.Round(total, 2);
            order.DiscountPct = Pick(new[] { 0m, 0m, 0m, 5m, 10m });
            order.DiscountAmount = Math.Round(order.TotalAmount * order.DiscountPct / 100m, 2);

            var taxRate = _taxRates.Count > 0 ? Pick(_taxRates) : null;
            order.TaxRateId = taxRate?.Id;
            order.TaxPct = taxRate?.Rate ?? 0;
            order.TaxAmount = Math.Round((order.TotalAmount - order.DiscountAmount) * order.TaxPct / 100m, 2);
            order.NetAmount = Math.Round(order.TotalAmount - order.DiscountAmount + order.TaxAmount, 2);
            order.Items = items;

            _context.SalesOrders.Add(order);

            if (status == SalesOrderStatus.Confirmed)
            {
                _confirmedOrders.Add(order);
                foreach (var item in items)
                    AddMovement("Sale", "SalesOrder", order.Id, item.ProductId, warehouse.Id, -item.Quantity, item.UnitPrice, order.CreatedAt, "Sales order confirmed");
            }
        }
    }

    private void SeedInvoices()
    {
        foreach (var order in _confirmedOrders)
        {
            if (!Chance(90))
                continue;

            _invCounter++;
            var issueDate = order.OrderDate.AddDays(Int(0, 5));
            var planned = PickInvoiceStatus();

            var invoice = new Invoice
            {
                InvoiceNumber = NewDocNumber("INV", _invCounter),
                OrderId = order.Id,
                CustomerId = order.CustomerId,
                IssueDate = issueDate,
                DueDate = issueDate.AddDays(Pick(new[] { 15, 30, 45, 60 })),
                Subtotal = order.TotalAmount,
                DiscountAmount = order.DiscountAmount,
                TaxAmount = order.TaxAmount,
                NetAmount = order.NetAmount,
                Status = planned,
                CreatedBy = OwnerId,
                CreatedAt = issueDate.ToDateTime(TimeOnly.MinValue)
            };

            invoice.PaidAmount = SeedCustomerPayments(invoice, planned);
            invoice.Status = ResolveInvoiceStatus(planned, invoice.PaidAmount, invoice.NetAmount);
            order.Invoice = invoice;

            _invoices.Add(invoice);
            _context.Invoices.Add(invoice);
        }
    }

    private decimal SeedCustomerPayments(Invoice invoice, InvoiceStatus planned)
    {
        if (planned is InvoiceStatus.Draft or InvoiceStatus.Cancelled or InvoiceStatus.Issued)
            return 0;

        var full = planned == InvoiceStatus.Paid;
        var portion = full ? 1m : Money(0.25m, 0.75m);
        var total = Math.Round(invoice.NetAmount * portion, 2);
        var payments = new List<Payment>();
        var remaining = total;
        var count = full ? Int(1, 3) : 1;
        var paymentDate = invoice.IssueDate.AddDays(Int(2, 15));

        for (var i = 0; i < count; i++)
        {
            var amount = i == count - 1 ? remaining : Math.Round(total / count, 2);
            remaining -= amount;
            if (amount <= 0) continue;

            payments.Add(new Payment
            {
                InvoiceId = invoice.Id,
                Amount = amount,
                PaymentMethod = (PaymentMethod)Int(0, 4),
                PaymentDate = paymentDate.AddDays(i * 7),
                Reference = $"RCPT-{Int(100000, 999999)}",
                CreatedBy = OwnerId,
                CreatedAt = paymentDate.AddDays(i * 7).ToDateTime(TimeOnly.MinValue)
            });
        }

        invoice.Payments = payments;
        return Math.Round(payments.Sum(p => p.Amount), 2);
    }

    private static InvoiceStatus ResolveInvoiceStatus(InvoiceStatus planned, decimal paid, decimal net)
    {
        if (planned is InvoiceStatus.Draft or InvoiceStatus.Cancelled)
            return planned;
        if (paid <= 0)
            return InvoiceStatus.Issued;
        return paid >= net ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
    }

    private InvoiceStatus PickInvoiceStatus()
    {
        var roll = Int(0, 100);
        return roll switch
        {
            < 40 => InvoiceStatus.Paid,
            < 65 => InvoiceStatus.PartiallyPaid,
            < 85 => InvoiceStatus.Issued,
            < 93 => InvoiceStatus.Draft,
            _ => InvoiceStatus.Cancelled
        };
    }

    private void SeedQuotations()
    {
        for (var i = 0; i < 120; i++)
        {
            _qtCounter++;
            var customer = Pick(_customers);
            var quotationDate = DateTimeBefore(200, 1);
            var status = (QuotationStatus)Int(0, 6);

            var quotation = new Quotation
            {
                QuotationNumber = NewDocNumber("QT", _qtCounter),
                CustomerId = customer.Id,
                QuotationDate = quotationDate,
                ExpiryDate = quotationDate.AddDays(Pick(new[] { 14, 21, 30 })),
                Status = status,
                Notes = "Quotation valid until expiry date.",
                SentBy = status >= QuotationStatus.Sent ? OwnerId : null,
                SentAt = status >= QuotationStatus.Sent ? quotationDate.AddHours(6) : null,
                RespondedBy = status >= QuotationStatus.Accepted ? OwnerId : null,
                RespondedAt = status >= QuotationStatus.Accepted ? quotationDate.AddDays(2) : null,
                CreatedBy = OwnerId,
                CreatedAt = quotationDate
            };

            var items = new List<QuotationItem>();
            decimal subtotal = 0;

            foreach (var product in _products.OrderBy(_ => _rnd.Next()).Take(Int(1, 6)))
            {
                var quantity = Qty(1, 50);
                var unitPrice = Math.Round(product.SalePrice * Money(0.95m, 1.1m), 2);
                var discountPercent = Pick(new[] { 0m, 0m, 5m, 10m });
                var lineTotal = Math.Round(quantity * unitPrice * (1 - discountPercent / 100m), 2);
                subtotal += lineTotal;

                items.Add(new QuotationItem
                {
                    QuotationId = quotation.Id,
                    ProductId = product.Id,
                    Quantity = quantity,
                    UnitPrice = unitPrice,
                    DiscountPercent = discountPercent,
                    LineTotal = lineTotal,
                    CreatedBy = OwnerId,
                    CreatedAt = quotationDate
                });
            }

            quotation.Subtotal = Math.Round(subtotal, 2);
            quotation.DiscountAmount = Math.Round(subtotal * (Pick(new[] { 0m, 0m, 5m }) / 100m), 2);
            quotation.TaxAmount = Math.Round((subtotal - quotation.DiscountAmount) * 0.15m, 2);
            quotation.NetAmount = Math.Round(subtotal - quotation.DiscountAmount + quotation.TaxAmount, 2);
            quotation.Items = items;

            if (status == QuotationStatus.Converted && _confirmedOrders.Count > 0)
                quotation.ConvertedSalesOrderId = Pick(_confirmedOrders).Id;

            _context.Quotations.Add(quotation);
        }
    }

    private void SeedSalesReturns()
    {
        var eligible = _invoices.Where(i => i.Status is InvoiceStatus.Paid or InvoiceStatus.PartiallyPaid or InvoiceStatus.Issued).ToList();
        var count = Math.Min(40, eligible.Count);
        var chosen = eligible.OrderBy(_ => _rnd.Next()).Take(count).ToList();

        foreach (var invoice in chosen)
        {
            _sretCounter++;
            var order = _confirmedOrders.First(o => o.Id == invoice.OrderId);
            var returnDate = invoice.CreatedAt.AddDays(Int(2, 25));
            var status = (ReturnStatus)Int(0, 5);

            var ret = new SalesReturn
            {
                ReturnNumber = NewDocNumber("SRET", _sretCounter),
                InvoiceId = invoice.Id,
                CustomerId = invoice.CustomerId,
                WarehouseId = order.WarehouseId,
                Reason = Pick(DemoDataCatalog.ReturnReasons),
                ReturnDate = returnDate,
                Status = status,
                ApprovedBy = status >= ReturnStatus.Approved ? OwnerId : null,
                ApprovedAt = status >= ReturnStatus.Approved ? returnDate.AddHours(4) : null,
                CompletedAt = status == ReturnStatus.Completed ? returnDate.AddHours(9) : null,
                CreatedBy = OwnerId,
                CreatedAt = returnDate
            };

            var items = new List<SalesReturnItem>();
            decimal total = 0;
            var orderItems = order.Items.ToList();

            foreach (var orderItem in orderItems.OrderBy(_ => _rnd.Next()).Take(Int(1, orderItems.Count + 1)))
            {
                var quantity = Math.Round(orderItem.Quantity * Money(0.1m, 0.5m), 3);
                if (quantity <= 0) continue;
                var lineTotal = Math.Round(quantity * orderItem.UnitPrice, 2);
                total += lineTotal;

                items.Add(new SalesReturnItem
                {
                    SalesReturnId = ret.Id,
                    ProductId = orderItem.ProductId,
                    Quantity = quantity,
                    UnitPrice = orderItem.UnitPrice,
                    LineTotal = lineTotal,
                    Reason = Pick(DemoDataCatalog.ReturnReasons),
                    CreatedBy = OwnerId,
                    CreatedAt = returnDate
                });

                if (status == ReturnStatus.Completed)
                    AddMovement("SalesReturn", "SalesReturn", ret.Id, orderItem.ProductId, order.WarehouseId, quantity, orderItem.UnitPrice, returnDate);
            }

            ret.TotalAmount = total;
            ret.Items = items;
            _context.SalesReturns.Add(ret);
        }
    }
}
