using Server.Features.Inventory;
using Server.Features.Inventory.Entities;
using Server.Features.Inventory.Enums;

namespace Server.Infrastructure.Persistence.DemoData;

public partial class DemoDataSeeder
{
    private void SeedCategories()
    {
        foreach (var name in DemoDataCatalog.CategoryNames)
        {
            _catCounter++;
            var category = new Category
            {
                Name = name,
                Code = NewCode("CAT", _catCounter),
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(360, 420))
            };
            _categories.Add(category);
            _context.Categories.Add(category);
        }
    }

    private void SeedWarehouses()
    {
        var definitions = new (string Code, string Name, string Location)[]
        {
            ("WH-RUH", "Riyadh Main Warehouse", "Riyadh, Industrial City"),
            ("WH-JED", "Jeddah Distribution Center", "Jeddah, Islamic Port"),
            ("WH-DMM", "Dammam Regional Warehouse", "Dammam, Second Industrial Area"),
            ("WH-TRT", "Transit Warehouse", "Riyadh, Dry Port")
        };

        foreach (var definition in definitions)
        {
            _whCounter++;
            var warehouse = new Warehouse
            {
                Code = definition.Code,
                Name = definition.Name,
                Location = definition.Location,
                IsActive = true,
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(360, 420))
            };
            _warehouses.Add(warehouse);
            _context.Warehouses.Add(warehouse);
        }
    }

    private void SeedProducts()
    {
        var nouns = DemoDataCatalog.ProductNouns;
        var adjectives = DemoDataCatalog.ProductAdjectives;

        for (var i = 0; i < 150; i++)
        {
            _prodCounter++;
            var noun = nouns[i % nouns.Length];
            var adjective = adjectives[(i / nouns.Length) % adjectives.Length];
            var salePrice = Money(15, 1500);

            var product = new Product
            {
                Sku = NewCode("PRD", _prodCounter, 4),
                Name = $"{adjective} {noun}",
                Description = $"{adjective} {noun} suitable for industrial applications.",
                CategoryId = Pick(_categories).Id,
                UnitOfMeasure = Pick(DemoDataCatalog.UnitsOfMeasure),
                ReorderLevel = Int(20, 80),
                ReorderQty = Int(50, 250),
                SalePrice = salePrice,
                IsActive = Chance(94),
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(180, 360))
            };
            _products.Add(product);
            _context.Products.Add(product);
        }
    }

    private void InitializeOpeningStock()
    {
        foreach (var product in _products)
        {
            var count = Int(2, 4);
            var chosen = _warehouses.OrderBy(_ => _rnd.Next()).Take(count);
            foreach (var warehouse in chosen)
                GetStock(product.Id, warehouse.Id);
        }
    }

    private void SeedInventoryDocuments()
    {
        SeedStockTransfers();
        SeedStockAdjustments();
    }

    private void SeedStockTransfers()
    {
        for (var i = 0; i < 60; i++)
        {
            _trfCounter++;
            var product = Pick(_products);
            var from = Pick(_warehouses);
            Warehouse to;
            do { to = Pick(_warehouses); } while (to.Id == from.Id);

            var quantity = Qty(5, 80);
            var status = (StockTransferStatus)Pick(new[]
            {
                StockTransferStatus.Draft, StockTransferStatus.Submitted,
                StockTransferStatus.Approved, StockTransferStatus.Completed,
                StockTransferStatus.Completed, StockTransferStatus.Cancelled
            });
            var occurred = DateTimeBefore(120, 1);

            var transfer = new StockTransfer
            {
                TransferNumber = NewDocNumber("TRF", _trfCounter),
                FromWarehouseId = from.Id,
                ToWarehouseId = to.Id,
                ProductId = product.Id,
                Quantity = quantity,
                Status = status,
                Notes = $"Transfer of {product.Name} from {from.Name} to {to.Name}.",
                ApprovedBy = status >= StockTransferStatus.Approved ? OwnerId : null,
                ApprovedAt = status >= StockTransferStatus.Approved ? occurred.AddHours(3) : null,
                CompletedAt = status == StockTransferStatus.Completed ? occurred.AddHours(8) : null,
                CreatedBy = OwnerId,
                CreatedAt = occurred
            };

            if (status == StockTransferStatus.Completed)
            {
                AddMovement("Transfer", "StockTransfer", transfer.Id, product.Id, from.Id, -quantity, product.SalePrice * 0.6m, occurred.AddHours(8));
                AddMovement("Transfer", "StockTransfer", transfer.Id, product.Id, to.Id, quantity, product.SalePrice * 0.6m, occurred.AddHours(8));
            }

            _context.StockTransfers.Add(transfer);
        }
    }

    private void SeedStockAdjustments()
    {
        for (var i = 0; i < 50; i++)
        {
            var product = Pick(_products);
            var warehouse = Pick(_warehouses);
            var occurred = DateTimeBefore(150, 1);

            var systemQty = Math.Round(GetStock(product.Id, warehouse.Id), 3);
            var variance = Chance(50) ? Int(-40, 41) : Int(1, 41);
            var counted = Math.Max(0, systemQty + variance);

            var adjustment = new StockAdjustment
            {
                ProductId = product.Id,
                WarehouseId = warehouse.Id,
                SystemQty = systemQty,
                CountedQty = counted,
                Reason = Pick(new[] { "Cycle count", "Physical inventory", "Damage write-off", "Found stock", "Data correction" }),
                CreatedBy = OwnerId,
                CreatedAt = occurred
            };
            _context.StockAdjustments.Add(adjustment);

            var delta = counted - systemQty;
            if (delta != 0)
                AddMovement("Adjustment", "StockAdjustment", adjustment.Id, product.Id, warehouse.Id, delta, product.SalePrice * 0.6m, occurred, "Stock reconciliation");
        }
    }

    private void SeedInventoryLevels()
    {
        foreach (var entry in _stock)
        {
            var product = _products.First(p => p.Id == entry.Key.ProductId);

            _context.InventoryLevels.Add(new InventoryLevel
            {
                ProductId = entry.Key.ProductId,
                WarehouseId = entry.Key.WarehouseId,
                QuantityOnHand = Math.Round(entry.Value, 3),
                QuantityReserved = Chance(30) ? Int(0, 20) : 0,
                AvgCost = Math.Round(product.SalePrice * 0.62m, 2),
                LastMovement = DateTimeBefore(30, 1),
                CreatedBy = OwnerId,
                CreatedAt = _now.AddDays(-Int(120, 200))
            });
        }
    }
}
