namespace Server.Infrastructure.Persistence.DemoData;

/// <summary>
/// Static pools of English words used to build realistic-looking demo data.
/// No business logic here — just data.
/// </summary>
internal static class DemoDataCatalog
{
    public static readonly string[] FirstNames =
    {
        "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
        "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth",
        "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Daniel", "Matthew", "Anthony",
        "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kevin"
    };

    public static readonly string[] LastNames =
    {
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
        "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
    };

    public static readonly string[] CompanySuffixes =
    {
        "Trading Co.", "Industrial Supplies", "General Trading LLC", "Commercial Group",
        "Import & Export", "Enterprises", "Distribution Co.", "Wholesale Ltd.",
        "Retail Group", "Manufacturing Co."
    };

    public static readonly string[] CustomerPrefixes =
    {
        "Al Noor", "Gulf", "Delta", "Falcon", "Oasis", "Crescent", "Pioneer", "Summit",
        "Horizon", "Meridian", "Atlas", "Emirates", "Sahara", "Nile", "Pearl", "Cedar",
        "Orchid", "Jasmine", "Amber", "Coral", "Turquoise", "Onyx", "Sapphire", "Ruby",
        "Topaz", "Granite", "Marble", "Cobalt", "Copper", "Silverline", "Goldcrest",
        "Everest", "Zenith", "Nova", "Orbit", "Vertex", "Apex", "Prime", "Elite", "Crown"
    };

    public static readonly string[] SupplierPrefixes =
    {
        "Global", "National", "United", "Allied", "Premier", "Universal", "Continental",
        "Pacific", "Atlantic", "Imperial", "Sterling", "Royal", "Central", "Northern",
        "Southern", "Eastern", "Western", "Metro", "Metropolitan", "Coastal", "Highland",
        "Seaside", "Riverside", "Lakeside", "Summit", "Pinnacle", "Beacon", "Anchor",
        "Compass", "Harbor"
    };

    public static readonly string[] Cities =
    {
        "Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar", "Tabuk", "Abha",
        "Buraydah", "Hail", "Najran", "Jubail", "Yanbu", "Al Hofuf", "Taif", "Qatif"
    };

    public static readonly string[] Countries =
    {
        "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Qatar", "Oman",
        "Jordan", "Egypt", "Turkey", "India"
    };

    public static readonly string[] CategoryNames =
    {
        "Electronics", "Home Appliances", "Furniture", "Office Supplies", "Tools & Hardware",
        "Raw Materials", "Packaging", "Lighting", "Plumbing", "Electrical",
        "Safety Equipment", "Cleaning Supplies", "Automotive Parts", "Construction Materials",
        "Fasteners", "Bearings & Seals", "Pipes & Fittings", "Paints & Coatings",
        "Textiles", "Food & Beverage"
    };

    public static readonly string[] ProductNouns =
    {
        "Bolt", "Bracket", "Bearing", "Valve", "Cable", "Switch", "Sensor", "Panel",
        "Pump", "Filter", "Coupling", "Flange", "Gasket", "Connector", "Fastener",
        "Module", "Housing", "Roller", "Clamp", "Adapter", "Buffer", "Nozzle",
        "Spindle", "Bushing", "Spacer"
    };

    public static readonly string[] ProductAdjectives =
    {
        "Industrial", "Heavy-Duty", "Stainless", "Galvanized", "Reinforced", "Precision",
        "Standard", "Premium", "Compact", "Rugged", "Corrosion-Resistant", "High-Tensile"
    };

    public static readonly string[] UnitsOfMeasure =
    {
        "pcs", "box", "set", "kg", "meter", "roll", "pack", "unit"
    };

    public static readonly string[] DepartmentNames =
    {
        "Executive", "Finance", "Sales", "Purchasing", "Warehouse",
        "Human Resources", "Information Technology", "Marketing",
        "Operations", "Customer Service"
    };

    public static readonly string[] JobTitles =
    {
        "Director", "Manager", "Senior Specialist", "Specialist", "Coordinator",
        "Analyst", "Officer", "Supervisor", "Assistant", "Consultant"
    };

    public static readonly string[] ReturnReasons =
    {
        "Damaged on arrival", "Wrong item shipped", "Quality below specification",
        "Ordered by mistake", "Excess quantity", "Failed inspection",
        "Customer complaint", "Expired stock", "Packaging defect"
    };

    public static readonly string[] SupplierPaymentReferences =
    {
        "TT-2026-0001", "TT-2026-0002", "CHQ-451200", "CHQ-451201",
        "TRF-889001", "TRF-889002", "CASH-2026-01", "CASH-2026-02"
    };

    public static readonly string[] NotificationTitles =
    {
        "Low stock alert", "Invoice due soon", "Invoice overdue",
        "Purchase order submitted", "Purchase order approved",
        "Sales order confirmed", "Goods receipt completed",
        "Stock transfer approved", "Supplier invoice received", "System notification",
        "Leave request submitted", "Leave request approved", "Leave request rejected"
    };

    public static readonly string[] UserAgents =
    {
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/119.0 Safari/537.36"
    };
}
