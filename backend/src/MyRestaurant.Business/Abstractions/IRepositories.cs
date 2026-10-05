using MyRestaurant.Business.Entities;

namespace MyRestaurant.Business.Abstractions;

public interface IUserRepository
{
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct);
    Task<User?> FindByEmailAsync(string email, CancellationToken ct);
    Task<User?> FindByIdAsync(Guid id, CancellationToken ct);
    void Add(User user);
}

public interface ICategoryRepository
{
    Task<List<Category>> ListOrderedAsync(CancellationToken ct);
    Task<Category?> FindAsync(Guid id, CancellationToken ct);
    Task<Category?> FindWithItemsAsync(Guid id, CancellationToken ct);
    Task<bool> ExistsAsync(Guid id, CancellationToken ct);
    void Add(Category category);
    void Remove(Category category);
}

public interface IMenuItemRepository
{
    Task<List<MenuItem>> ListAsync(Guid? categoryId, bool availableOnly, CancellationToken ct);
    Task<MenuItem?> FindAsync(Guid id, CancellationToken ct);
    Task<MenuItem?> FindWithCategoryAsync(Guid id, CancellationToken ct);
    Task<IReadOnlyDictionary<Guid, MenuItem>> FindByIdsAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct);
    Task<bool> IsReferencedByOrdersAsync(Guid id, CancellationToken ct);
    Task LoadCategoryAsync(MenuItem item, CancellationToken ct);
    void Add(MenuItem item);
    void Remove(MenuItem item);
}

public interface IOrderRepository
{
    void Add(Order order);
    Task<List<Order>> ListAsync(Guid? userId, CancellationToken ct);
    Task<Order?> FindReadOnlyAsync(Guid id, CancellationToken ct);
    Task<Order?> FindTrackedAsync(Guid id, CancellationToken ct);
    Task LoadUserAsync(Order order, CancellationToken ct);
}

public interface IReservationRepository
{
    void Add(Reservation reservation);
    Task<List<Reservation>> ListAsync(Guid? userId, CancellationToken ct);
    Task<Reservation?> FindAsync(Guid id, CancellationToken ct);
}

public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken ct);
}
