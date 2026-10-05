using MyRestaurant.Business.Abstractions;
using MyRestaurant.Business.Common;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Business.Services;

public class OrderService(IOrderRepository orders, IMenuItemRepository menuItems, IUnitOfWork unitOfWork)
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
        var menu = await menuItems.FindByIdsAsync(ids, ct);
        var lines = new List<OrderItem>();

        foreach (var line in request.Items)
        {
            if (line.Quantity is < 1 or > 20)
                throw new AppException("تعداد هر غذا باید بین ۱ تا ۲۰ باشد.");
            if (!menu.TryGetValue(line.MenuItemId, out var dish))
                throw new AppException("یکی از غذاها پیدا نشد.", AppStatus.NotFound);
            if (!dish.IsAvailable)
                throw new AppException($"«{dish.Name}» فعلاً موجود نیست.");

            lines.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = dish.Id,
                ItemName = dish.Name,
                UnitPrice = dish.Price,
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

        orders.Add(order);
        await unitOfWork.SaveChangesAsync(ct);
        await orders.LoadUserAsync(order, ct);
        return Map(order);
    }

    public async Task<List<OrderResponse>> ListAsync(Guid userId, bool isAdmin, CancellationToken ct)
    {
        var items = await orders.ListAsync(isAdmin ? null : userId, ct);
        return items.Select(Map).ToList();
    }

    public async Task<OrderResponse> GetAsync(Guid id, Guid userId, bool isAdmin, CancellationToken ct)
    {
        var order = await orders.FindReadOnlyAsync(id, ct);
        if (order is null || (!isAdmin && order.UserId != userId))
            throw new AppException("سفارش پیدا نشد.", AppStatus.NotFound);

        return Map(order);
    }

    public async Task<OrderResponse> UpdateStatusAsync(Guid id, string? status, CancellationToken ct)
    {
        if (!Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsed))
            throw new AppException("وضعیت سفارش معتبر نیست.");

        var order = await orders.FindTrackedAsync(id, ct)
            ?? throw new AppException("سفارش پیدا نشد.", AppStatus.NotFound);

        order.Status = parsed;
        await unitOfWork.SaveChangesAsync(ct);
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
