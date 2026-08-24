using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Core.Common;
using Server.Features.Notifications.Models;
using Server.Features.Notifications.Services;

namespace Server.Features.Notifications.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _service;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(INotificationService service, ICurrentUserService currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int take = 20)
    {
        var userId = _currentUser.UserId!.Value;
        var result = await _service.GetUserNotificationsAsync(userId, Math.Clamp(take, 1, 100));
        return Ok(ApiResponse<List<NotificationResponse>>.SuccessResult(result));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = _currentUser.UserId!.Value;
        var count = await _service.GetUnreadCountAsync(userId);
        return Ok(ApiResponse<int>.SuccessResult(count));
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userId = _currentUser.UserId!.Value;
        await _service.MarkAsReadAsync(id, userId);
        return Ok(ApiResponse<object>.SuccessResult(null!));
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = _currentUser.UserId!.Value;
        await _service.MarkAllAsReadAsync(userId);
        return Ok(ApiResponse<object>.SuccessResult(null!));
    }
}
