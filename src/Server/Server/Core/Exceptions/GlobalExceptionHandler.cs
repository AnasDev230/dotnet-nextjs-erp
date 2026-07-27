using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Server.Core.Common;

namespace Server.Core.Exceptions;

public class GlobalExceptionHandler
{
    private readonly RequestDelegate _next;

    public GlobalExceptionHandler(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Failure(ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (BusinessException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Failure(ex.Message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var response = ApiResponse<object>.Failure("An unexpected error occurred.", [ex.Message]);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
