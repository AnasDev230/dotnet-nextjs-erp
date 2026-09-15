
> Bilingual (AR/EN) Enterprise Resource Planning system built with ASP.NET Core 9, SQL Server, and Next.js 16.

[![.NET 9](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2019+-CC2927)](https://www.microsoft.com/sql-server)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

## 1. Overview

Bunyan ERP is a full-stack, Arabic-first (RTL) ERP with English (LTR) support. It follows **Feature-Based Vertical Slice** architecture on both backend and frontend: 12 self-contained modules covering Sales, Purchasing, Inventory, HR, Finance, Reports, Dashboard, Settings, Security, Audit, Notifications, and Global Search.

## 2. Key Features

- **Inventory:** Products, Categories, Warehouses, Stock Levels, Adjustments, Transfers (submit/approve/complete/cancel workflow)
- **Sales:** Customers, Orders, Quotations, Returns, Invoices, Payments
- **Purchasing:** Suppliers, Purchase Orders (draft/submit/approve/receive workflow), Goods Receipts, Supplier Invoices, Purchase Payments, Product-Suppliers, Returns
- **HR:** Departments, Employees, Attendance (daily + bulk + summary), Payroll Runs + Payslips
- **Finance:** Sales Invoices, Invoice Payments
- **Dashboard:** Stats, recent orders/invoices, low-stock alerts, overdue invoices
- **Reports:** Sales, Purchases, Inventory, Employees, Customer Statement + CSV export
- **Platform:** Audit Logs, Notifications, Global Search, 9 Print templates (invoice, quotation, orders, receipts, payslip, statement)
- **UX:** Bilingual AR/EN with RTL/LTR switching, dark mode (class-based), form validation, toasts on every mutation, ConfirmDialog for destructive actions

## 3. Tech Stack

| Layer    | Technology |
| -------- | ---------- |
| Backend  | ASP.NET Core 9 (`net9.0`), EF Core 9 (SQL Server), ASP.NET Core Identity (`IdentityUser<Guid>`), JWT (30 min access + 7 day refresh), FluentValidation 11.3.1, Swashbuckle 9.0.6 |
| Frontend | Next.js 16.2 (App Router), React 19, TypeScript 5, Tailwind CSS 4, TanStack Query 5, Zustand 5, React Hook Form + Zod 4, Axios, lucide-react |
| Database | Microsoft SQL Server 2019+ |
| Auth     | Identity Core + `UserManager` / `SignInManager`, short-lived access tokens + long-lived refresh tokens, 5 seeded roles |

## 4. Architecture

```text
src/Server/Server/
├── Features/          # Sales, Purchasing, Inventory, HR, Finance, Reports,
│                      # Settings, Security, Dashboard, Audit, Notifications, Search
│                      # each: Controllers/ Services/ Repositories/ Models/ Validators/
├── Core/              # Common (ApiResponse, PagedResult, BaseEntity), Exceptions, Extensions
├── Infrastructure/    # Persistence (AppDbContext, Configurations ~35, DatabaseSeeder), Services
├── Migrations/        # EF Core migrations (user applies manually)
└── Program.cs         # JWT, Identity, CORS, RateLimiting, HSTS, Swagger, /health

src/client/src/
├── app/(auth)/login/            # Login only
├── app/(dashboard)/             # Sidebar + Header layout: sales, purchasing, inventory,
│                                # hr, finance, reports, settings, audit-logs, notifications
├── features/*/                  # api/, hooks/, schemas/, components/, types/ (mirrors backend)
├── components/ui|layout|shared|print/
├── lib/ (api-client, i18n, formatters, error-handler) + translations (ar.ts/en.ts)
├── hooks/ (use-translation, use-toast, use-print) + stores/ (auth, language, theme, toast)
└── middleware.ts                # Redirects unauthenticated users to /login
```

## 5. Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 20+ and npm
- SQL Server 2019+ (local or remote)
- EF Core CLI (only if you apply migrations yourself): `dotnet tool install --global dotnet-ef`

### Backend (API)

```bash
cd src/Server/Server
dotnet restore
```

1. Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=ErpDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "SecretKey": "ReplaceWithYourOwnKeyOfAtLeast32Characters!",
    "Issuer": "BunyanERP",
    "Audience": "BunyanERPUsers"
  }
}
```

2. Apply migrations manually (maintainer-owned) and run:

```bash
dotnet ef database update
dotnet run
```

- API: `https://localhost:7086/api`
- Swagger (Development only): `https://localhost:7086/swagger`
- Health check: `https://localhost:7086/health`

On first run `DatabaseSeeder` creates the 5 roles and the initial SuperAdmin account automatically.

### Frontend (Client)

```bash
cd src/client
npm install
```

1. Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://localhost:7086/api
```

2. Run:

```bash
npm run dev
```

- App: `http://localhost:3000/login`

## 6. Configuration

| Key | Source | Notes |
| --- | ------ | ----- |
| `ConnectionStrings:DefaultConnection` | `appsettings.json` | SQL Server connection string |
| `JwtSettings:SecretKey` | `appsettings.json` | Minimum 32 characters, keep secret |
| `JwtSettings:Issuer / Audience` | `appsettings.json` | `BunyanERP` / `BunyanERPUsers` |
| `JwtSettings:AccessTokenExpirationMinutes` | `appsettings.json` | `30` |
| `JwtSettings:RefreshTokenExpirationDays` | `appsettings.json` | `7` |
| `NEXT_PUBLIC_API_URL` | `src/client/.env.local` | e.g. `https://localhost:7086/api` |
| Backend port | `Properties/launchSettings.json` | `7086` (HTTPS) |
| Frontend port | Next.js default | `3000` |

## 7. Roles & Security

| Role | Access |
| ---- | ------ |
| `SuperAdmin` | Full access, user management, audit logs |
| `SalesManager` | Sales module |
| `PurchasingManager` | Purchasing module |
| `WarehouseKeeper` | Inventory module |
| `HRManager` | HR module |

Security: specific-origin CORS policy (`AllowNextJsClient`), fixed-window rate limiting (60 req/min global, stricter `strict` policy for auth endpoints), HSTS + `X-Content-Type-Options` + `X-Frame-Options: DENY`, `UseHttpsRedirection`, centralized `GlobalExceptionHandler` returning `ApiResponse<T>`, soft deletes + `RowVersion` concurrency on entities.

## 8. API Overview

```text
Auth:        POST /api/auth/login, /refresh-token, /logout
Sales:       CRUD /api/customers, /api/sales-orders, /api/quotations, /api/sales-returns
Finance:     CRUD /api/invoices, POST /api/invoices/{id}/payments
Purchasing:  CRUD /api/suppliers, /api/purchase-orders, /api/goods-receipts,
                    /api/supplier-invoices, /api/purchase-returns, /api/product-suppliers
             PATCH /api/purchase-orders/{id}/submit, /approve, /cancel
Inventory:   CRUD /api/products, /api/categories, /api/warehouses, /api/stock-adjustments
             CRUD /api/stock-transfers + /submit, /approve, /complete, /cancel
             GET  /api/stock-movements, /api/inventory-levels
HR:          CRUD /api/departments, /api/employees, /api/attendance, /api/payroll-runs
Reports:     GET /api/reports/sales, /purchases, /inventory, /employees, /customer-statement/{id}
             GET /api/reports/export/*
Dashboard:   GET /api/dashboard/stats, /recent-orders, /recent-invoices, /low-stock
Settings:    GET/PUT /api/settings/company, /api/settings/users, /api/profile
Audit:       GET /api/audit-logs
```

## 9. Project Status & Roadmap

**Done:** Auth + RBAC backend, Inventory, Sales (orders/quotations/returns/invoices), Purchasing (PO/GRN/supplier invoices/payments/returns), HR (departments/employees/attendance/payroll), Dashboard, 5 Reports + CSV, Settings, Audit, Notifications, Search, bilingual UI, print templates.

**Next:** Full GL accounting (`ChartOfAccounts`, `JournalEntries/Lines` with balanced-debit rule, `AccountingPeriods` open/close, `CostCenters`, `BankAccounts/Transactions`) with auto-posting from Sales/Purchasing/Payroll/Stock; UI route guards per role; Docker + CI; CRM and Projects modules (currently documented in `DATABASE_SCHEMA.md` only).

## 10. License

MIT — see [LICENSE](./LICENSE).
