using System.Text;

namespace Server.Features.Reports.Services;

public static class CsvExportHelper
{
    /// <summary>
    /// Generates CSV content manually using StringBuilder.
    /// No external CSV libraries required.
    /// Handles Arabic text by using UTF-8 BOM for Excel compatibility.
    /// </summary>
    public static byte[] GenerateCsv(string[] headers, List<string[]> rows)
    {
        var sb = new StringBuilder();

        // UTF-8 BOM for Excel Arabic compatibility
        sb.Append('\uFEFF');

        // Headers
        sb.AppendLine(string.Join(",", headers.Select(EscapeCsvField)));

        // Rows
        foreach (var row in rows)
        {
            sb.AppendLine(string.Join(",", row.Select(EscapeCsvField)));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    /// <summary>
    /// Quotes output only when needed to minimize file size.
    /// </summary>
    private static string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field))
            return "";

        if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }

        return field;
    }
}