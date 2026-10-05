namespace MyRestaurant.Api.Entities;

public enum UserRole
{
    Customer = 0,
    Admin = 1
}

public enum OrderStatus
{
    Pending = 0,
    Preparing = 1,
    Ready = 2,
    Completed = 3,
    Cancelled = 4
}

public enum ReservationStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2
}
