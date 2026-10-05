using MyRestaurant.Business.Entities;

namespace MyRestaurant.Business.Interfaces;

public interface IPasswordHasher
{
    string Hash(User user, string password);
    bool Verify(User user, string passwordHash, string password);
}
