using Server.Features.Purchasing.Entities;
using Server.Features.Purchasing.Enums;
using Server.Features.Sales.Enums;

namespace Server.Infrastructure.Persistence.DemoData;

public partial class DemoDataSeeder
{
    private readonly List<PurchaseOrder> _purchaseOrders = new();
    private readonly Dictionary<Guid, List<PoItem>> _poItems = new();
    private readonly List<SupplierInvoice> _supplierInvoices = new();

    private Task SeedPurchasingAsync()
    {
        SeedSuppliers();
        SeedProductSuppliers();
        SeedPurchaseOrders();
        SeedGoodsReceipts();
        SeedSupplierInvoices();
        SeedPurchaseReturns();
        return Task.CompletedTask;
    }

    private void SeedSuppliers()
    {
        for (var i = 0; i < 40; i++)
        {
            _supCounter++;
            var first = Pick(DemoDataCatalog.FirstNames);
            var last = Pick(DemoDataCatalog.LastNames);

            _suppliers.Add(new Supplier
            {
                Code = NewCode("SUP", _supCounter),
                Name = $"{Pick(DemoDataCatalog.SupplierPrefixes)} {Pick(DemoDataCatalog.CompanySuffixes)}",
                ContactPerson = $"{first} {last}",
                Email = $"{first.ToLower()}.{last.ToLower()}@supplier{i + 1}.com",
                Phone = $"+966 5{Int(0, 10)}{Int(1000000, 9999999)}",
                TaxNumber = Int(300000000, 399999999).ToString(),
                PaymentTerms = Pick(new[] { 30, 45, 60, 90 }),
                Rating = Math.Round(Money(3, 5), 1),
                Status = Chance(90) ? SupplierStatus.Active : SupplierStatus.Suspended,
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(200, 400)),
            });
        }

        _context.Suppliers.AddRange(_suppliers);
    }

    private void SeedProductSuppliers()
    {
        var links = new List<ProductSupplier>();

        foreach (var product in _products)
        {
            var count = Int(1, 3);
            var chosen = _suppliers.OrderBy(_ => _rnd.Next()).Take(count).ToList();

            for (var i = 0; i < chosen.Count; i++)
            {
                links.Add(new ProductSupplier
                {
                    ProductId = product.Id,
                    SupplierId = chosen[i].Id,
                    SupplierSku = $"SP-{Int(10000, 99999)}",
                    LeadTimeDays = Int(3, 30),
                    MinOrderQty = Int(10, 120),
                    UnitCost = Math.Round(product.SalePrice * Money(0.5m, 0.72m), 2),
                    IsPrimary = i == 0,
                    CreatedBy = OwnerId,
                    CreatedAt = _now.AddDays(-Int(150, 350)),
                });
            }
        }

        _context.ProductSuppliers.AddRange(links);
    }

    private void SeedPurchaseOrders()
    {
        for (var i = 0; i < 180; i++)
        {
            _poCounter++;
            var supplier = Pick(_suppliers);
            var orderDate = DateOnlyBefore(320, 5);
            var status = PickStatus();

            var po = new PurchaseOrder
            {
                PoNumber = NewDocNumber("PO", _poCounter),
                SupplierId = supplier.Id,
                OrderDate = orderDate,
                ExpectedDate = orderDate.AddDays(Int(7, 31)),
                Status = status,
                Currency = "SAR",
                Terms = $"Net {supplier.PaymentTerms}",
                ApprovedBy = status >= PurchaseOrderStatus.Approved ? OwnerId : null,
                ApprovedAt = status >= PurchaseOrderStatus.Approved
                    ? orderDate.ToDateTime(TimeOnly.MinValue).AddDays(1)
                    : null,
                CreatedBy = OwnerId,
                CreatedAt = orderDate.ToDateTime(TimeOnly.MinValue),
            };

            var items = new List<PoItem>();
            var productCount = Int(1, 7);
            var chosenProducts = _products.OrderBy(_ => _rnd.Next()).Take(productCount).ToList();
            decimal total = 0;

            foreach (var product in chosenProducts)
            {
                var quantity = Qty(10, 300);
                var unitPrice = Math.Round(product.SalePrice * Money(0.5m, 0.68m), 2);
                var lineTotal = Math.Round(quantity * unitPrice, 2);
                total += lineTotal;

                items.Add(new PoItem
                {
                    PurchaseOrderId = po.Id,
                    ProductId = product.Id,
                    Quantity = quantity,
                    ReceivedQty = 0,
                    UnitPrice = unitPrice,
                    LineTotal = lineTotal,
                    CreatedBy = OwnerId,
                    CreatedAt = po.CreatedAt,
                });
            }

            po.TotalAmount = total;
            po.Items = items;
            _purchaseOrders.Add(po);
            _poItems[po.Id] = items;
            _context.PurchaseOrders.Add(po);
        }
    }

    private PurchaseOrderStatus PickStatus() => (PurchaseOrderStatus)Pick(new[]
    {
        PurchaseOrderStatus.Draft, PurchaseOrderStatus.Draft,
        PurchaseOrderStatus.Submitted, PurchaseOrderStatus.Submitted,
        PurchaseOrderStatus.Approved, PurchaseOrderStatus.Approved,
        PurchaseOrderStatus.Cancelled,
        PurchaseOrderStatus.PartiallyReceived,
        PurchaseOrderStatus.Received, PurchaseOrderStatus.Received, PurchaseOrderStatus.Received
    });

    private void SeedGoodsReceipts()
    {
        foreach (var po in _purchaseOrders)
        {
            if (po.Status is not (PurchaseOrderStatus.Received or PurchaseOrderStatus.PartiallyReceived))
                continue;

            _grnCounter++;
            var warehouse = Pick(_warehouses);
            var receiptDate = po.OrderDate.AddDays(Int(5, 25));
            var status = Chance(92) ? GoodsReceiptStatus.Received : GoodsReceiptStatus.Cancelled;

            var grn = new GoodsReceipt
            {
                GrnNumber = NewDocNumber("GRN", _grnCounter),
                PurchaseOrderId = po.Id,
                ReceiptDate = receiptDate,
                WarehouseId = warehouse.Id,
                Status = status,
                Notes = $"Goods receipt for purchase order {po.PoNumber}.",
                CreatedBy = OwnerId,
                CreatedAt = receiptDate.ToDateTime(TimeOnly.MinValue),
            };

            var items = _poItems[po.Id];
            var fullyReceived = po.Status == PurchaseOrderStatus.Received;
            var itemList = new List<GoodsReceiptItem>();

            foreach (var poItem in items)
            {
                var quantity = fullyReceived
                    ? poItem.Quantity
                    : Math.Round(poItem.Quantity * Money(0.3m, 0.75m), 3);
                if (quantity <= 0) continue;

                itemList.Add(new GoodsReceiptItem
                {
                    GoodsReceiptId = grn.Id,
                    PoItemId = poItem.Id,
                    ProductId = poItem.ProductId,
                    Quantity = quantity,
                    CreatedBy = OwnerId,
                    CreatedAt = grn.CreatedAt,
                });

                if (status == GoodsReceiptStatus.Received)
                {
                    poItem.ReceivedQty += quantity;
                    AddMovement("Purchase", "GoodsReceipt", grn.Id, poItem.ProductId, warehouse.Id, quantity, poItem.UnitPrice, grn.CreatedAt);
                }
            }

            grn.Items = itemList;
            _goodsReceipts.Add(grn);
            _context.GoodsReceipts.Add(grn);

            if (status == GoodsReceiptStatus.Received)
                po.Status = fullyReceived ? PurchaseOrderStatus.Received : PurchaseOrderStatus.PartiallyReceived;
            else
                po.Status = PurchaseOrderStatus.Approved;
        }
    }

    private void SeedSupplierInvoices()
    {
        foreach (var grn in _goodsReceipts)
        {
            if (grn.Status == GoodsReceiptStatus.Cancelled || !Chance(80))
                continue;

            var po = _purchaseOrders.First(p => p.Id == grn.PurchaseOrderId);
            _sinvCounter++;

            var subtotal = Math.Round(grn.Items.Sum(item =>
            {
                var poItem = _poItems[po.Id].First(pi => pi.Id == item.PoItemId);
                return item.Quantity * poItem.UnitPrice;
            }), 2);

            var tax = Math.Round(subtotal * 0.15m, 2);
            var net = subtotal + tax;
            var issueDate = grn.ReceiptDate.AddDays(Int(1, 6));
            var status = PickSupplierInvoiceStatus();

            var invoice = new SupplierInvoice
            {
                InvoiceNumber = NewDocNumber("SINV", _sinvCounter),
                PurchaseOrderId = po.Id,
                SupplierId = po.SupplierId,
                IssueDate = issueDate.ToDateTime(TimeOnly.MinValue),
                DueDate = issueDate.AddDays(30).ToDateTime(TimeOnly.MinValue),
                Subtotal = subtotal,
                TaxAmount = tax,
                NetAmount = net,
                Status = status,
                Notes = $"Supplier invoice for {grn.GrnNumber}.",
                SupplierReference = $"SUP-INV-{Int(10000, 99999)}",
                CreatedBy = OwnerId,
                CreatedAt = issueDate.ToDateTime(TimeOnly.MinValue),
            };

            invoice.PaidAmount = SeedSupplierPayments(invoice, net, status);
            invoice.Status = ResolveSupplierInvoiceStatus(status, invoice.PaidAmount, net);

            _context.SupplierInvoices.Add(invoice);
            _supplierInvoices.Add(invoice);
        }
    }

    private decimal SeedSupplierPayments(SupplierInvoice invoice, decimal net, SupplierInvoiceStatus plannedStatus)
    {
        if (plannedStatus is SupplierInvoiceStatus.Draft or SupplierInvoiceStatus.Cancelled or SupplierInvoiceStatus.Received)
            return 0;

        var full = plannedStatus == SupplierInvoiceStatus.Paid;
        var portion = full ? 1m : Money(0.3m, 0.75m);
        var total = Math.Round(net * portion, 2);
        var payments = new List<PurchasePayment>();
        var remaining = total;
        var paymentDate = invoice.IssueDate.AddDays(Int(3, 20));

        var count = full ? Int(1, 3) : 1;
        for (var i = 0; i < count; i++)
        {
            var amount = i == count - 1 ? remaining : Math.Round(total / count, 2);
            remaining -= amount;
            if (amount <= 0) continue;

            payments.Add(new PurchasePayment
            {
                SupplierInvoiceId = invoice.Id,
                Amount = amount,
                Method = (PurchasePaymentMethod)Int(0, 4),
                PaymentDate = paymentDate.AddDays(i * 10),
                Reference = Pick(DemoDataCatalog.SupplierPaymentReferences),
                CreatedBy = OwnerId,
                CreatedAt = paymentDate.AddDays(i * 10),
            });
        }

        invoice.Payments = payments;
        return Math.Round(payments.Sum(p => p.Amount), 2);
    }

    private static SupplierInvoiceStatus ResolveSupplierInvoiceStatus(SupplierInvoiceStatus planned, decimal paid, decimal net)
    {
        if (planned is SupplierInvoiceStatus.Draft or SupplierInvoiceStatus.Cancelled)
            return planned;
        if (paid <= 0)
            return SupplierInvoiceStatus.Received;
        return paid >= net ? SupplierInvoiceStatus.Paid : SupplierInvoiceStatus.PartiallyPaid;
    }

    private SupplierInvoiceStatus PickSupplierInvoiceStatus()
    {
        var roll = Int(0, 100);
        return roll switch
        {
            < 35 => SupplierInvoiceStatus.Paid,
            < 60 => SupplierInvoiceStatus.PartiallyPaid,
            < 82 => SupplierInvoiceStatus.Received,
            < 92 => SupplierInvoiceStatus.Draft,
            _ => SupplierInvoiceStatus.Cancelled
        };
    }

    private void SeedPurchaseReturns()
    {
        var eligible = _goodsReceipts.Where(g => g.Status == GoodsReceiptStatus.Received).ToList();
        var count = Math.Min(30, eligible.Count);
        var chosen = eligible.OrderBy(_ => _rnd.Next()).Take(count).ToList();

        foreach (var grn in chosen)
        {
            _pretCounter++;
            var po = _purchaseOrders.First(p => p.Id == grn.PurchaseOrderId);
            var returnDate = grn.CreatedAt.AddDays(Int(2, 20));
            var status = (ReturnStatus)Int(0, 5);

            var ret = new PurchaseReturn
            {
                ReturnNumber = NewDocNumber("PRET", _pretCounter),
                GoodsReceiptId = grn.Id,
                SupplierId = po.SupplierId,
                WarehouseId = grn.WarehouseId,
                Reason = Pick(DemoDataCatalog.ReturnReasons),
                ReturnDate = returnDate,
                Status = status,
                ApprovedBy = status >= ReturnStatus.Approved ? OwnerId : null,
                ApprovedAt = status >= ReturnStatus.Approved ? returnDate.AddHours(4) : null,
                CompletedAt = status == ReturnStatus.Completed ? returnDate.AddHours(9) : null,
                CreatedBy = OwnerId,
                CreatedAt = returnDate,
            };

            var items = new List<PurchaseReturnItem>();
            decimal total = 0;
            foreach (var grnItem in grn.Items.OrderBy(_ => _rnd.Next()).Take(Int(1, grn.Items.Count + 1)))
            {
                var quantity = Math.Round(grnItem.Quantity * Money(0.1m, 0.5m), 3);
                if (quantity <= 0) continue;
                var poItem = _poItems[po.Id].First(pi => pi.Id == grnItem.PoItemId);
                var lineTotal = Math.Round(quantity * poItem.UnitPrice, 2);
                total += lineTotal;

                items.Add(new PurchaseReturnItem
                {
                    PurchaseReturnId = ret.Id,
                    ProductId = grnItem.ProductId,
                    Quantity = quantity,
                    UnitCost = poItem.UnitPrice,
                    LineTotal = lineTotal,
                    Reason = Pick(DemoDataCatalog.ReturnReasons),
                    CreatedBy = OwnerId,
                    CreatedAt = returnDate,
                });

                if (status == ReturnStatus.Completed)
                    AddMovement("PurchaseReturn", "PurchaseReturn", ret.Id, grnItem.ProductId, grn.WarehouseId, -quantity, poItem.UnitPrice, returnDate);
            }

            ret.TotalAmount = total;
            ret.Items = items;
            _context.PurchaseReturns.Add(ret);
        }
    }
}
