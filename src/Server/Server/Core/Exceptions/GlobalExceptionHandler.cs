using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using FluentValidation;
using Server.Core.Common;

namespace Server.Core.Exceptions;

public class GlobalExceptionHandler
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "UNHANDLED EXCEPTION | Path: {Path} | Method: {Method} | Type: {ExceptionType} | Message: {Message}",
                context.Request.Path,
                context.Request.Method,
                ex.GetType().Name,
                ex.Message);

            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = MapException(exception);

        if (context.Response.HasStarted)
        {
            _logger.LogWarning(
                "Cannot write error response for {Path}: response has already started. Original error: {OriginalError}",
                context.Request.Path,
                message);
            return;
        }

        try
        {
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var response = ApiResponse<object>.Failure(message);
            var json = JsonSerializer.Serialize(response, JsonOptions);

            await context.Response.WriteAsync(json);
        }
        catch (Exception secondaryEx)
        {
            _logger.LogError(secondaryEx,
                "SECONDARY EXCEPTION while writing error response for {Path}. Application remains alive.",
                context.Request.Path);
        }
    }

    private static (int StatusCode, string Message) MapException(Exception exception) => exception switch
    {
        NotFoundException ex =>
            (StatusCodes.Status404NotFound, ex.Message),

        BusinessException ex =>
            (StatusCodes.Status400BadRequest, ex.Message),

        ValidationException ve =>
            (StatusCodes.Status400BadRequest,
             ve.Errors.FirstOrDefault()?.ErrorMessage ?? "Validation failed"),

        UnauthorizedAccessException =>
            (StatusCodes.Status401Unauthorized, "Unauthorized access"),

        DbUpdateConcurrencyException =>
            (StatusCodes.Status409Conflict,
             "Data was modified by another user. Please refresh and try again"),

        DbUpdateException =>
            (StatusCodes.Status500InternalServerError,
             "A database error occurred. Please try again"),

        JsonException =>
            (StatusCodes.Status400BadRequest, "Invalid request format"),

        InvalidOperationException ex =>
            (StatusCodes.Status400BadRequest, ex.Message),

        ArgumentException ex =>
            (StatusCodes.Status400BadRequest, ex.Message),

        _ =>
            (StatusCodes.Status500InternalServerError,
             "An unexpected server error occurred. Please try again")
    };
}
