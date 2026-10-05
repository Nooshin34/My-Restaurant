using MyRestaurant.Business.Abstractions;
using MyRestaurant.Business.Common;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Business.Services;

public class AuthService(IUserRepository users, IPasswordHasher passwords, IUnitOfWork unitOfWork)
{
    public async Task<User> RegisterAsync(RegisterRequest request, CancellationToken ct)
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

        if (await users.ExistsByEmailAsync(email, ct))
            throw new AppException("این ایمیل قبلاً ثبت شده است.", AppStatus.Conflict);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Email = email,
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwords.Hash(user, password);
        users.Add(user);
        await unitOfWork.SaveChangesAsync(ct);
        return user;
    }

    public async Task<User> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = (request.Email ?? "").Trim().ToLowerInvariant();
        var user = await users.FindByEmailAsync(email, ct);
        var password = request.Password ?? "";

        if (user is null || !passwords.Verify(user, user.PasswordHash, password))
            throw new AppException("ایمیل یا رمز عبور نادرست است.", AppStatus.Unauthorized);

        return user;
    }

    public async Task<UserResponse> GetMeAsync(Guid userId, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(userId, ct)
            ?? throw new AppException("کاربر پیدا نشد.", AppStatus.NotFound);
        return ToResponse(user);
    }

    public static UserResponse ToResponse(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role.ToString());
}
