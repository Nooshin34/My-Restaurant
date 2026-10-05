using Microsoft.EntityFrameworkCore;
using MyRestaurant.Api.Common;
using MyRestaurant.Api.Data;
using MyRestaurant.Api.Dtos;
using MyRestaurant.Api.Entities;

namespace MyRestaurant.Api.Services;

public class OrderService(AppDbContext db)
{
    public async Task<OrderResponse> CreateAsync(Guid userId, CreateOrderRequest request, CancellationToken ct)
    {
        if (request.Items is null || request.Items.Count == 0)
            throw new AppException("سبد خرید خالی است.");
        if (request.Items.Count > 30)
            throw new AppException("تعداد ردیف‌های سفارش بیش از حد است.");

        var note = (request.Note ?? "").Trim();
        if (note.Length > 500)
            throw new AppException("توضیح سفارش طولانی است.");

        var ids = request.Items.Select(item => item.MenuItemId).Distinct().ToList();
        var menuItems = await db.MenuItems.Where(item => ids.Contains(item.Id)).ToDictionaryAsync(item => item.Id, ct);
        var lines = new List<OrderItem>();

        foreach (var line in request.Items)
        {
            if (line.Quantity is < 1 or > 20)
                throw new AppException("تعداد هر غذا باید بین ۱ تا ۲۰ باشد.");
            if (!menuItems.TryGetValue(line.MenuItemId, out var menu))
                throw new AppException("یکی از غذاها پیدا نشد.", StatusCodes.Status404NotFound);
            if (!menu.IsAvailable)
                throw new AppException($"«{menu.Name}» فعلاً موجود نیست.");

            lines.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = menu.Id,
                ItemName = menu.Name,
                UnitPrice = menu.Price,
                Quantity = line.Quantity
            });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Status = OrderStatus.Pending,
            Note = note.Length == 0 ? null : note,
            CreatedAt = DateTime.UtcNow,
            Total = lines.Sum(line => line.UnitPrice * line.Quantity),
            Items = lines
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        await db.Entry(order).Reference(item => item.User).LoadAsync(ct);
        return Map(order);
    }

    public async Task<List<OrderResponse>> ListAsync(Guid userId, bool isAdmin, CancellationToken ct)
    {
        var query = db.Orders.AsNoTracking().Include(order => order.Items).Include(order => order.User).AsQueryable();
        if (!isAdmin)
            query = query.Where(order => order.UserId == userId);

        var orders = await query.OrderByDescending(order => order.CreatedAt).ToListAsync(ct);
        return orders.Select(Map).ToList();
    }

    public async Task<OrderResponse> GetAsync(Guid id, Guid userId, bool isAdmin, CancellationToken ct)
    {
        var order = await db.Orders.AsNoTracking()
            .Include(item => item.Items)
            .Include(item => item.User)
            .FirstOrDefaultAsync(item => item.Id == id, ct);

        if (order is null || (!isAdmin && order.UserId != userId))
            throw new AppException("سفارش پیدا نشد.", StatusCodes.Status404NotFound);

        return Map(order);
    }

    public async Task<OrderResponse> UpdateStatusAsync(Guid id, string? status, CancellationToken ct)
    {
        if (!Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsed))
            throw new AppException("وضعیت سفارش معتبر نیست.");

        var order = await db.Orders.Include(item => item.Items).Include(item => item.User)
            .FirstOrDefaultAsync(item => item.Id == id, ct)
            ?? throw new AppException("سفارش پیدا نشد.", StatusCodes.Status404NotFound);

        order.Status = parsed;
        await db.SaveChangesAsync(ct);
        return Map(order);
    }

    private static OrderResponse Map(Order order) => new(
        order.Id,
        order.UserId,
        order.User.FullName,
        order.Status.ToString(),
        order.Total,
        order.Note,
        order.CreatedAt,
        order.Items.Select(item => new OrderItemResponse(item.MenuItemId, item.ItemName, item.UnitPrice, item.Quantity)).ToList());
}
