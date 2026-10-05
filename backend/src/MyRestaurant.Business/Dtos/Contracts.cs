namespace MyRestaurant.Business.Dtos;

public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record UserResponse(Guid Id, string FullName, string Email, string Role);
public record AuthResponse(string Token, DateTime ExpiresAt, UserResponse User);

public record CategoryResponse(Guid Id, string Name, string? Description, int SortOrder);
public record UpsertCategoryRequest(string Name, string? Description, int SortOrder);

public record MenuItemResponse(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    string Name,
    string? Description,
    string? Ingredients,
    decimal Price,
    bool IsAvailable,
    string? ImageUrl);

public record UpsertMenuItemRequest(
    Guid CategoryId,
    string Name,
    string? Description,
    string? Ingredients,
    decimal Price,
    bool IsAvailable,
    string? ImageUrl);

public record CreateOrderItemRequest(Guid MenuItemId, int Quantity);
public record CreateOrderRequest(string? Note, List<CreateOrderItemRequest> Items);
public record OrderItemResponse(Guid MenuItemId, string ItemName, decimal UnitPrice, int Quantity);
public record OrderResponse(
    Guid Id,
    Guid UserId,
    string CustomerName,
    string Status,
    decimal Total,
    string? Note,
    DateTime CreatedAt,
    List<OrderItemResponse> Items);
public record UpdateStatusRequest(string Status);

public record CreateReservationRequest(
    string GuestName,
    string Phone,
    int PartySize,
    DateTime ReservedFor,
    string? Note);

public record ReservationResponse(
    Guid Id,
    Guid UserId,
    string GuestName,
    string Phone,
    int PartySize,
    DateTime ReservedFor,
    string? Note,
    string Status,
    DateTime CreatedAt);
