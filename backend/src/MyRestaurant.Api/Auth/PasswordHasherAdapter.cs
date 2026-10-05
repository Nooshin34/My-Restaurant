using Microsoft.AspNetCore.Identity;
using MyRestaurant.Business.Entities;
using BusinessHasher = MyRestaurant.Business.Abstractions.IPasswordHasher;

namespace MyRestaurant.Api.Auth;

public class PasswordHasherAdapter(IPasswordHasher<User> inner) : BusinessHasher
{
    public string Hash(User user, string password) => inner.HashPassword(user, password);

    public bool Verify(User user, string passwordHash, string password) =>
        inner.VerifyHashedPassword(user, passwordHash, password) != PasswordVerificationResult.Failed;
}
