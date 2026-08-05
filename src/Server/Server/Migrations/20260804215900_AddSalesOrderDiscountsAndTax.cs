using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesOrderDiscountsAndTax : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "sales_orders",
                type: "decimal(15,2)",
                precision: 15,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPct",
                table: "sales_orders",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NetAmount",
                table: "sales_orders",
                type: "decimal(15,2)",
                precision: 15,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "sales_orders",
                type: "decimal(15,2)",
                precision: 15,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxPct",
                table: "sales_orders",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "TaxRateId",
                table: "sales_orders",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPct",
                table: "sales_order_items",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "tax_rates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false, defaultValue: 0m),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tax_rates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sales_orders_TaxRateId",
                table: "sales_orders",
                column: "TaxRateId");

            migrationBuilder.CreateIndex(
                name: "IX_tax_rates_Name",
                table: "tax_rates",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_sales_orders_tax_rates_TaxRateId",
                table: "sales_orders",
                column: "TaxRateId",
                principalTable: "tax_rates",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_sales_orders_tax_rates_TaxRateId",
                table: "sales_orders");

            migrationBuilder.DropTable(
                name: "tax_rates");

            migrationBuilder.DropIndex(
                name: "IX_sales_orders_TaxRateId",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "DiscountPct",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "NetAmount",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "TaxPct",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "TaxRateId",
                table: "sales_orders");

            migrationBuilder.DropColumn(
                name: "DiscountPct",
                table: "sales_order_items");
        }
    }
}
