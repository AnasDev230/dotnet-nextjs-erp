namespace Server.Core.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> SuccessResult(T data, string message = "Operation completed successfully")
        => new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Failure(string message, List<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors };
}
