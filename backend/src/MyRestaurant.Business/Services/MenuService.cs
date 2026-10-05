using MyRestaurant.Business.Interfaces;
using MyRestaurant.Business.Common;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Business.Services;

public class MenuService(ICategoryRepository categories, IMenuItemRepository menuItems, IUnitOfWork unitOfWork)
{
    public async Task<List<CategoryResponse>> ListCategoriesAsync(CancellationToken ct)
    {
        var items = await categories.ListOrderedAsync(ct);
        return items.Select(Map).ToList();
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
        categories.Add(category);
        await unitOfWork.SaveChangesAsync(ct);
        return Map(category);
    }

    public async Task<CategoryResponse> UpdateCategoryAsync(Guid id, UpsertCategoryRequest request, CancellationToken ct)
    {
        var category = await categories.FindAsync(id, ct)
            ?? throw new AppException("دسته‌بندی پیدا نشد.", AppStatus.NotFound);

        category.Name = RequireName(request.Name, 80);
        category.Description = Clean(request.Description, 400);
        category.SortOrder = request.SortOrder;
        await unitOfWork.SaveChangesAsync(ct);
        return Map(category);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken ct)
    {
        var category = await categories.FindWithItemsAsync(id, ct)
            ?? throw new AppException("دسته‌بندی پیدا نشد.", AppStatus.NotFound);

        if (category.Items.Count > 0)
            throw new AppException("این دسته غذا دارد و قابل حذف نیست.", AppStatus.Conflict);

        categories.Remove(category);
        await unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<List<MenuItemResponse>> ListMenuItemsAsync(Guid? categoryId, bool? availableOnly, CancellationToken ct)
    {
        var items = await menuItems.ListAsync(categoryId, availableOnly == true, ct);
        return items.Select(Map).ToList();
    }

    public async Task<MenuItemResponse> CreateMenuItemAsync(UpsertMenuItemRequest request, CancellationToken ct)
    {
        if (!await categories.ExistsAsync(request.CategoryId, ct))
            throw new AppException("دسته‌بندی پیدا نشد.", AppStatus.NotFound);

        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = RequireName(request.Name, 120),
            Description = Clean(request.Description, 800),
            Ingredients = Clean(request.Ingredients, 1000),
            Price = RequirePrice(request.Price),
            IsAvailable = request.IsAvailable,
            ImageUrl = Clean(request.ImageUrl, 500)
        };
        menuItems.Add(item);
        await unitOfWork.SaveChangesAsync(ct);
        await menuItems.LoadCategoryAsync(item, ct);
        return Map(item);
    }

    public async Task<MenuItemResponse> UpdateMenuItemAsync(Guid id, UpsertMenuItemRequest request, CancellationToken ct)
    {
        var item = await menuItems.FindWithCategoryAsync(id, ct)
            ?? throw new AppException("غذا پیدا نشد.", AppStatus.NotFound);

        if (!await categories.ExistsAsync(request.CategoryId, ct))
            throw new AppException("دسته‌بندی پیدا نشد.", AppStatus.NotFound);

        item.CategoryId = request.CategoryId;
        item.Name = RequireName(request.Name, 120);
        item.Description = Clean(request.Description, 800);
        item.Ingredients = Clean(request.Ingredients, 1000);
        item.Price = RequirePrice(request.Price);
        item.IsAvailable = request.IsAvailable;
        item.ImageUrl = Clean(request.ImageUrl, 500);
        await unitOfWork.SaveChangesAsync(ct);
        await menuItems.LoadCategoryAsync(item, ct);
        return Map(item);
    }

    public async Task DeleteMenuItemAsync(Guid id, CancellationToken ct)
    {
        var item = await menuItems.FindAsync(id, ct)
            ?? throw new AppException("غذا پیدا نشد.", AppStatus.NotFound);

        if (await menuItems.IsReferencedByOrdersAsync(id, ct))
            throw new AppException("این غذا در سفارش‌ها استفاده شده و قابل حذف نیست.", AppStatus.Conflict);

        menuItems.Remove(item);
        await unitOfWork.SaveChangesAsync(ct);
    }

    private static CategoryResponse Map(Category category) =>
        new(category.Id, category.Name, category.Description, category.SortOrder);

    private static MenuItemResponse Map(MenuItem item) =>
        new(item.Id, item.CategoryId, item.Category.Name, item.Name, item.Description, item.Ingredients, item.Price, item.IsAvailable, item.ImageUrl);

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
