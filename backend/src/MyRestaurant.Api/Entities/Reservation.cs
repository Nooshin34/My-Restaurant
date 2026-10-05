namespace MyRestaurant.Api.Entities;

public class Reservation
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string GuestName { get; set; } = "";
    public string Phone { get; set; } = "";
    public int PartySize { get; set; }
    public DateTime ReservedFor { get; set; }
    public string? Note { get; set; }
    public ReservationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
