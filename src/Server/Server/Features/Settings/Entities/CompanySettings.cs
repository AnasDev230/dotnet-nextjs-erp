using Server.Core.Common;

namespace Server.Features.Settings.Entities;

/// <summary>
/// Stores company/organization information.
/// Only ONE record should exist (singleton pattern).
/// </summary>
public class CompanySettings : BaseEntity
{
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyNameEn { get; set; }
    public string? TaxNumber { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? LogoUrl { get; set; }
    public string Currency { get; set; } = "SAR";
}