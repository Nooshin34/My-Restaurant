using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Services;

namespace MyRestaurant.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(MenuService menu) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryResponse>>> List(CancellationToken ct) =>
        Ok(await menu.ListCategoriesAsync(ct));

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(UpsertCategoryRequest request, CancellationToken ct)
    {
        var created = await menu.CreateCategoryAsync(request, ct);
        return Created($"/api/categories/{created.Id}", created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryResponse>> Update(Guid id, UpsertCategoryRequest request, CancellationToken ct) =>
        Ok(await menu.UpdateCategoryAsync(id, request, ct));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await menu.DeleteCategoryAsync(id, ct);
        return NoContent();
    }
}
