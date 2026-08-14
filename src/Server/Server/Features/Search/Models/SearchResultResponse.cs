namespace Server.Features.Search.Models;

public class SearchResultResponse
{
    public List<SearchResultItem> Employees { get; set; } = new();
    public List<SearchResultItem> Customers { get; set; } = new();
    public List<SearchResultItem> Suppliers { get; set; } = new();
    public List<SearchResultItem> Products { get; set; } = new();
    public List<SearchResultItem> SalesOrders { get; set; } = new();
    public List<SearchResultItem> PurchaseOrders { get; set; } = new();
    public List<SearchResultItem> Invoices { get; set; } = new();
    public List<SearchResultItem> Departments { get; set; } = new();
    public List<SearchResultItem> Warehouses { get; set; } = new();
}