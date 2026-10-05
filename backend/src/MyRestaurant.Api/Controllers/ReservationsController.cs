using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyRestaurant.Api.Common;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Services;

namespace MyRestaurant.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reservations")]
public class ReservationsController(ReservationService reservations) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ReservationResponse>>> List(CancellationToken ct) =>
        Ok(await reservations.ListAsync(User.GetUserId(), User.IsAdmin(), ct));

    [HttpPost]
    public async Task<ActionResult<ReservationResponse>> Create(CreateReservationRequest request, CancellationToken ct)
    {
        var created = await reservations.CreateAsync(User.GetUserId(), request, ct);
        return Created($"/api/reservations/{created.Id}", created);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<ReservationResponse>> Cancel(Guid id, CancellationToken ct) =>
        Ok(await reservations.CancelAsync(id, User.GetUserId(), User.IsAdmin(), ct));

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<ReservationResponse>> UpdateStatus(Guid id, UpdateStatusRequest request, CancellationToken ct) =>
        Ok(await reservations.UpdateStatusAsync(id, request.Status, ct));
}
