using Microsoft.EntityFrameworkCore;
using MyRestaurant.Api.Common;
using MyRestaurant.Api.Data;
using MyRestaurant.Api.Dtos;
using MyRestaurant.Api.Entities;

namespace MyRestaurant.Api.Services;

public class MenuService(AppDbContext db)
{
    public async Task<List<CategoryResponse>> ListCategoriesAsync(CancellationToken ct)
    {
        return await db.Categories
            .AsNoTracking()
            .OrderBy(category => category.SortOrder)
            .ThenBy(category => category.Name)
            .Select(category => new CategoryResponse(category.Id, category.Name, category.Description, category.SortOrder))
            .ToListAsync(ct);
    }

    public async Task<CategoryResponse> CreateCategoryAsync(UpsertCategoryRequest request, CancellationToken ct)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = RequireName(request.Name, 80),
            Description = Clean(request.Description, 400),
            SortOrder = request.SortOrder
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);
        return Map(category);
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(Guid id, UpsertCategoryRequest request, CancellationToken ct)
    {
        var category = await db.Categories.FirstOrDefaultAsync(item => item.Id == id, ct)
            ?? throw new AppException("دسته‌بندی پیدا نشد.", StatusCodes.Status404NotFound);

        category.Name = RequireName(request.Name, 80);
        category.Description = Clean(request.Description, 400);
        category.SortOrder = request.SortOrder;
        await db.SaveChangesAsync(ct);
        return Map(category);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken ct)
    {
        var category = await db.Categories.Include(item => item.Items).FirstOrDefaultAsync(item => item.Id == id, ct)
            ?? throw new AppException("دسته‌بندی پیدا نشد.", StatusCodes.Status404NotFound);

        if (category.Items.Count > 0)
            throw new AppException("این دسته غذا دارد و قابل حذف نیست.", StatusCodes.Status409Conflict);

        db.Categories.Remove(category);
        await db.SaveChangesAsync(ct);
    }

    public async Task<List<MenuItemResponse>> ListMenuItemsAsync(Guid? categoryId, bool? availableOnly, CancellationToken ct)
    {
        var query = db.MenuItems.AsNoTracking().Include(item => item.Category).AsQueryable();
        if (categoryId is not null)
            query = query.Where(item => item.CategoryId == categoryId);
        if (availableOnly == true)
            query = query.Where(item => item.IsAvailable);

        var items = await query
            .OrderBy(item => item.Category.SortOrder)
            .ThenBy(item => item.Name)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    public async Task<MenuItemResponse> CreateMenuItemAsync(UpsertMenuItemRequest request, CancellationToken ct)
    {
        await EnsureCategoryAsync(request.CategoryId, ct);
        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = RequireName(request.Name, 120),
            Description = Clean(request.Description, 800),
            Price = RequirePrice(request.Price),
            IsAvailable = request.IsAvailable,
            ImageUrl = Clean(request.ImageUrl, 500)
        };
        db.MenuItems.Add(item);
        await db.SaveChangesAsync(ct);
        await db.Entry(item).Reference(menuItem => menuItem.Category).LoadAsync(ct);
        return Map(item);
    }

    public async Task<MenuItemResponse> UpdateMenuItemAsync(Guid id, UpsertMenuItemRequest request, CancellationToken ct)
    {
        var item = await db.MenuItems.Include(menuItem => menuItem.Category).FirstOrDefaultAsync(menuItem => menuItem.Id == id, ct)
            ?? throw new AppException("غذا پیدا نشد.", StatusCodes.Status404NotFound);

        await EnsureCategoryAsync(request.CategoryId, ct);
        item.CategoryId = request.CategoryId;
        item.Name = RequireName(request.Name, 120);
        item.Description = Clean(request.Description, 800);
        item.Price = RequirePrice(request.Price);
        item.IsAvailable = request.IsAvailable;
        item.ImageUrl = Clean(request.ImageUrl, 500);
        await db.SaveChangesAsync(ct);
        await db.Entry(item).Reference(menuItem => menuItem.Category).LoadAsync(ct);
        return Map(item);
    }

    public async Task DeleteMenuItemAsync(Guid id, CancellationToken ct)
    {
        var item = await db.MenuItems.FirstOrDefaultAsync(menuItem => menuItem.Id == id, ct)
            ?? throw new AppException("غذا پیدا نشد.", StatusCodes.Status404NotFound);

        var used = await db.OrderItems.AnyAsync(orderItem => orderItem.MenuItemId == id, ct);
        if (used)
            throw new AppException("این غذا در سفارش‌ها استفاده شده و قابل حذف نیست.", StatusCodes.Status409Conflict);

        db.MenuItems.Remove(item);
        await db.SaveChangesAsync(ct);
    }

    private async Task EnsureCategoryAsync(Guid categoryId, CancellationToken ct)
    {
        if (!await db.Categories.AnyAsync(category => category.Id == categoryId, ct))
            throw new AppException("دسته‌بندی پیدا نشد.", StatusCodes.Status404NotFound);
    }

    private static CategoryResponse Map(Category category) =>
        new(category.Id, category.Name, category.Description, category.SortOrder);

    private static MenuItemResponse Map(MenuItem item) =>
        new(item.Id, item.CategoryId, item.Category.Name, item.Name, item.Description, item.Price, item.IsAvailable, item.ImageUrl);

    private static string RequireName(string? value, int max)
    {
        var name = (value ?? "").Trim();
        if (name.Length < 2)
            throw new AppException("نام باید حداقل ۲ حرف باشد.");
        if (name.Length > max)
            throw new AppException("نام خیلی طولانی است.");
        return name;
    }

    private static decimal RequirePrice(decimal price)
    {
        if (price < 0)
            throw new AppException("قیمت نمی‌تواند منفی باشد.");
        return price;
    }

    private static string? Clean(string? value, int max)
    {
        var text = (value ?? "").Trim();
        if (text.Length == 0)
            return null;
        if (text.Length > max)
            throw new AppException("متن واردشده طولانی است.");
        return text;
    }
}
