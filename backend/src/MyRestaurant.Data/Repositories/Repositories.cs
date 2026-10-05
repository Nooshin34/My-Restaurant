using Microsoft.EntityFrameworkCore;
using MyRestaurant.Business.Interfaces;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Data.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<bool> ExistsByEmailAsync(string email, CancellationToken ct) =>
        db.Users.AnyAsync(user => user.Email == email, ct);

    public Task<User?> FindByEmailAsync(string email, CancellationToken ct) =>
        db.Users.FirstOrDefaultAsync(user => user.Email == email, ct);

    public Task<User?> FindByIdAsync(Guid id, CancellationToken ct) =>
        db.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == id, ct);

    public void Add(User user) => db.Users.Add(user);
}

public class CategoryRepository(AppDbContext db) : ICategoryRepository
{
    public Task<List<Category>> ListOrderedAsync(CancellationToken ct) =>
        db.Categories.AsNoTracking()
            .OrderBy(category => category.SortOrder)
            .ThenBy(category => category.Name)
            .ToListAsync(ct);

    public Task<Category?> FindAsync(Guid id, CancellationToken ct) =>
        db.Categories.FirstOrDefaultAsync(category => category.Id == id, ct);

    public Task<Category?> FindWithItemsAsync(Guid id, CancellationToken ct) =>
        db.Categories.Include(category => category.Items).FirstOrDefaultAsync(category => category.Id == id, ct);

    public Task<bool> ExistsAsync(Guid id, CancellationToken ct) =>
        db.Categories.AnyAsync(category => category.Id == id, ct);

    public void Add(Category category) => db.Categories.Add(category);

    public void Remove(Category category) => db.Categories.Remove(category);
}

public class MenuItemRepository(AppDbContext db) : IMenuItemRepository
{
    public async Task<List<MenuItem>> ListAsync(Guid? categoryId, bool availableOnly, CancellationToken ct)
    {
        var query = db.MenuItems.AsNoTracking().Include(item => item.Category).AsQueryable();
        if (categoryId is not null)
            query = query.Where(item => item.CategoryId == categoryId);
        if (availableOnly)
            query = query.Where(item => item.IsAvailable);

        return await query
            .OrderBy(item => item.Category.SortOrder)
            .ThenBy(item => item.Name)
            .ToListAsync(ct);
    }

    public Task<MenuItem?> FindAsync(Guid id, CancellationToken ct) =>
        db.MenuItems.FirstOrDefaultAsync(item => item.Id == id, ct);

    public Task<MenuItem?> FindWithCategoryAsync(Guid id, CancellationToken ct) =>
        db.MenuItems.Include(item => item.Category).FirstOrDefaultAsync(item => item.Id == id, ct);

    public async Task<IReadOnlyDictionary<Guid, MenuItem>> FindByIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        var items = await db.MenuItems.Where(item => ids.Contains(item.Id)).ToListAsync(ct);
        return items.ToDictionary(item => item.Id);
    }

    public Task<bool> IsReferencedByOrdersAsync(Guid id, CancellationToken ct) =>
        db.OrderItems.AnyAsync(orderItem => orderItem.MenuItemId == id, ct);

    public Task LoadCategoryAsync(MenuItem item, CancellationToken ct) =>
        db.Entry(item).Reference(menuItem => menuItem.Category).LoadAsync(ct);

    public void Add(MenuItem item) => db.MenuItems.Add(item);

    public void Remove(MenuItem item) => db.MenuItems.Remove(item);
}

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public void Add(Order order) => db.Orders.Add(order);

    public async Task<List<Order>> ListAsync(Guid? userId, CancellationToken ct)
    {
        var query = db.Orders.AsNoTracking().Include(order => order.Items).Include(order => order.User).AsQueryable();
        if (userId is not null)
            query = query.Where(order => order.UserId == userId);

        return await query.OrderByDescending(order => order.CreatedAt).ToListAsync(ct);
    }

    public Task<Order?> FindReadOnlyAsync(Guid id, CancellationToken ct) =>
        db.Orders.AsNoTracking()
            .Include(order => order.Items)
            .Include(order => order.User)
            .FirstOrDefaultAsync(order => order.Id == id, ct);

    public Task<Order?> FindTrackedAsync(Guid id, CancellationToken ct) =>
        db.Orders.Include(order => order.Items)
            .Include(order => order.User)
            .FirstOrDefaultAsync(order => order.Id == id, ct);

    public Task LoadUserAsync(Order order, CancellationToken ct) =>
        db.Entry(order).Reference(item => item.User).LoadAsync(ct);
}

public class ReservationRepository(AppDbContext db) : IReservationRepository
{
    public void Add(Reservation reservation) => db.Reservations.Add(reservation);

    public async Task<List<Reservation>> ListAsync(Guid? userId, CancellationToken ct)
    {
        var query = db.Reservations.AsNoTracking().AsQueryable();
        if (userId is not null)
            query = query.Where(reservation => reservation.UserId == userId);

        return await query.OrderByDescending(reservation => reservation.ReservedFor).ToListAsync(ct);
    }

    public Task<Reservation?> FindAsync(Guid id, CancellationToken ct) =>
        db.Reservations.FirstOrDefaultAsync(reservation => reservation.Id == id, ct);
}

public class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
