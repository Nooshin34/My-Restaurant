using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MyRestaurant.Business.Common;

namespace MyRestaurant.Api.Common;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(value, out var id))
            throw new AppException("نشست کاربری معتبر نیست.", StatusCodes.Status401Unauthorized);

        return id;
    }

    public static bool IsAdmin(this ClaimsPrincipal user) => user.IsInRole("Admin");
}
