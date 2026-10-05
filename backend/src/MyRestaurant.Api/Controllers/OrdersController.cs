using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyRestaurant.Api.Common;
using MyRestaurant.Api.Dtos;
using MyRestaurant.Api.Services;

namespace MyRestaurant.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController(OrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<OrderResponse>>> List(CancellationToken ct) =>
        Ok(await orders.ListAsync(User.GetUserId(), User.IsAdmin(), ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> Get(Guid id, CancellationToken ct) =>
        Ok(await orders.GetAsync(id, User.GetUserId(), User.IsAdmin(), ct));

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var created = await orders.CreateAsync(User.GetUserId(), request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(Guid id, UpdateStatusRequest request, CancellationToken ct) =>
        Ok(await orders.UpdateStatusAsync(id, request.Status, ct));
}
