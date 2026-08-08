using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class AddHRModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ParentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ManagerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_departments_departments_ParentId",
                        column: x => x.ParentId,
                        principalTable: "departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    HireDate = table.Column<DateOnly>(type: "date", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    JobTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmploymentType = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)0),
                    Salary = table.Column<decimal>(type: "decimal(15,2)", precision: 15, scale: 2, nullable: false, defaultValue: 0m),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false, defaultValue: "SAR"),
                    ManagerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<byte>(type: "tinyint", nullable: false, defaultValue: (byte)0),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_employees_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_employees_departments_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "departments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_employees_employees_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_departments_Code",
                table: "departments",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_departments_ManagerId",
                table: "departments",
                column: "ManagerId",
                unique: true,
                filter: "[ManagerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_departments_ParentId",
                table: "departments",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_employees_DepartmentId",
                table: "employees",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_employees_Email",
                table: "employees",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_employees_EmployeeNumber",
                table: "employees",
                column: "EmployeeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_employees_ManagerId",
                table: "employees",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_employees_Status",
                table: "employees",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_employees_UserId",
                table: "employees",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_departments_employees_ManagerId",
                table: "departments",
                column: "ManagerId",
                principalTable: "employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_departments_employees_ManagerId",
                table: "departments");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropTable(
                name: "departments");
        }
    }
}
