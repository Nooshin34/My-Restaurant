using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyRestaurant.Api.Common;
using MyRestaurant.Api.Services;
using MyRestaurant.Business.Dtos;
using MyRestaurant.Business.Services;

namespace MyRestaurant.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService auth, JwtTokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        var user = await auth.RegisterAsync(request, ct);
        return Ok(tokens.CreateAuthResponse(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var user = await auth.LoginAsync(request, ct);
        return Ok(tokens.CreateAuthResponse(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> Me(CancellationToken ct) =>
        Ok(await auth.GetMeAsync(User.GetUserId(), ct));
}
