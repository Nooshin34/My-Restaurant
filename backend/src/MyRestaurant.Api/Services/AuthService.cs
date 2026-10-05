using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyRestaurant.Api.Common;
using MyRestaurant.Api.Data;
using MyRestaurant.Api.Dtos;
using MyRestaurant.Api.Entities;

namespace MyRestaurant.Api.Services;

public class AuthService(AppDbContext db, IPasswordHasher<User> hasher, JwtTokenService tokens)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct)
    {
        var fullName = (request.FullName ?? "").Trim();
        var email = (request.Email ?? "").Trim().ToLowerInvariant();
        var password = request.Password ?? "";

        if (fullName.Length < 2)
            throw new AppException("نام باید حداقل ۲ حرف باشد.");
        if (fullName.Length > 120)
            throw new AppException("نام خیلی طولانی است.");
        if (email.Length is < 5 or > 256 || !email.Contains('@') || !email.Contains('.'))
            throw new AppException("ایمیل معتبر نیست.");
        if (password.Length < 8)
            throw new AppException("رمز عبور باید حداقل ۸ کاراکتر باشد.");

        if (await db.Users.AnyAsync(user => user.Email == email, ct))
            throw new AppException("این ایمیل قبلاً ثبت شده است.", StatusCodes.Status409Conflict);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = hasher.HashPassword(user, password);
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return tokens.CreateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = (request.Email ?? "").Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email, ct);
        var password = request.Password ?? "";

        if (user is null || hasher.VerifyHashedPassword(user, user.PasswordHash, password) == PasswordVerificationResult.Failed)
            throw new AppException("ایمیل یا رمز عبور نادرست است.", StatusCodes.Status401Unauthorized);

        return tokens.CreateAuthResponse(user);
    }

    public async Task<UserResponse> GetMeAsync(Guid userId, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId, ct)
            ?? throw new AppException("کاربر پیدا نشد.", StatusCodes.Status404NotFound);
        return ToResponse(user);
    }

    public static UserResponse ToResponse(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role.ToString());
}
