using MyRestaurant.Business.Abstractions;
using MyRestaurant.Business.Common;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Business.Services;

public class ReservationService(IReservationRepository reservations, IUnitOfWork unitOfWork)
{
    public async Task<ReservationResponse> CreateAsync(Guid userId, CreateReservationRequest request, CancellationToken ct)
    {
        var guestName = (request.GuestName ?? "").Trim();
        var phone = (request.Phone ?? "").Trim();
        var note = (request.Note ?? "").Trim();

        if (guestName.Length is < 2 or > 120)
            throw new AppException("نام مهمان معتبر نیست.");
        if (phone.Length is < 8 or > 30)
            throw new AppException("شماره تماس معتبر نیست.");
        if (request.PartySize is < 1 or > 20)
            throw new AppException("تعداد مهمان‌ها باید بین ۱ تا ۲۰ باشد.");
        if (note.Length > 500)
            throw new AppException("توضیح رزرو طولانی است.");

        var when = ToUtc(request.ReservedFor);
        if (when < DateTime.UtcNow.AddMinutes(30))
            throw new AppException("زمان رزرو باید حداقل ۳۰ دقیقه بعد باشد.");
        if (when > DateTime.UtcNow.AddDays(60))
            throw new AppException("رزرو حداکثر تا ۶۰ روز آینده ممکن است.");

        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GuestName = guestName,
            Phone = phone,
            PartySize = request.PartySize,
            ReservedFor = when,
            Note = note.Length == 0 ? null : note,
            Status = ReservationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        reservations.Add(reservation);
        await unitOfWork.SaveChangesAsync(ct);
        return Map(reservation);
    }

    public async Task<List<ReservationResponse>> ListAsync(Guid userId, bool isAdmin, CancellationToken ct)
    {
        var items = await reservations.ListAsync(isAdmin ? null : userId, ct);
        return items.Select(Map).ToList();
    }

    public async Task<ReservationResponse> UpdateStatusAsync(Guid id, string? status, CancellationToken ct)
    {
        if (!Enum.TryParse<ReservationStatus>(status, ignoreCase: true, out var parsed))
            throw new AppException("وضعیت رزرو معتبر نیست.");

        var reservation = await reservations.FindAsync(id, ct)
            ?? throw new AppException("رزرو پیدا نشد.", AppStatus.NotFound);

        reservation.Status = parsed;
        await unitOfWork.SaveChangesAsync(ct);
        return Map(reservation);
    }

    public async Task<ReservationResponse> CancelAsync(Guid id, Guid userId, bool isAdmin, CancellationToken ct)
    {
        var reservation = await reservations.FindAsync(id, ct);
        if (reservation is null || (!isAdmin && reservation.UserId != userId))
            throw new AppException("رزرو پیدا نشد.", AppStatus.NotFound);

        if (reservation.Status == ReservationStatus.Cancelled)
            return Map(reservation);

        reservation.Status = ReservationStatus.Cancelled;
        await unitOfWork.SaveChangesAsync(ct);
        return Map(reservation);
    }

    private static DateTime ToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Local).ToUniversalTime()
    };

    private static ReservationResponse Map(Reservation reservation) => new(
        reservation.Id,
        reservation.UserId,
        reservation.GuestName,
        reservation.Phone,
        reservation.PartySize,
        reservation.ReservedFor,
        reservation.Note,
        reservation.Status.ToString(),
        reservation.CreatedAt);
}
