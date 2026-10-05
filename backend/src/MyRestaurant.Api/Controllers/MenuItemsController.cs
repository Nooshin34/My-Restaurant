using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Services;

namespace MyRestaurant.Api.Controllers;

[ApiController]
[Route("api/menu-items")]
public class MenuItemsController(MenuService menu) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<MenuItemResponse>>> List(
        [FromQuery] Guid? categoryId,
        [FromQuery] bool? availableOnly,
        CancellationToken ct) =>
        Ok(await menu.ListMenuItemsAsync(categoryId, availableOnly, ct));

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<MenuItemResponse>> Create(UpsertMenuItemRequest request, CancellationToken ct)
    {
        var created = await menu.CreateMenuItemAsync(request, ct);
        return Created($"/api/menu-items/{created.Id}", created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MenuItemResponse>> Update(Guid id, UpsertMenuItemRequest request, CancellationToken ct) =>
        Ok(await menu.UpdateMenuItemAsync(id, request, ct));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await menu.DeleteMenuItemAsync(id, ct);
        return NoContent();
    }
}
