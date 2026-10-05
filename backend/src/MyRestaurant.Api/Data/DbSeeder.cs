using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyRestaurant.Api.Entities;

namespace MyRestaurant.Api.Data;

public static class DbSeeder
{
    public const string AdminEmail = "admin@myrestaurant.local";
    public const string AdminPassword = "Admin123!";
    public const string CustomerEmail = "customer@myrestaurant.local";
    public const string CustomerPassword = "Customer123!";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher<User> hasher, CancellationToken ct = default)
    {
        if (!await db.Users.AnyAsync(ct))
        {
            db.Users.Add(CreateUser(hasher, "مدیر رستوران", AdminEmail, AdminPassword, UserRole.Admin));
            db.Users.Add(CreateUser(hasher, "مهمان نمونه", CustomerEmail, CustomerPassword, UserRole.Customer));
            await db.SaveChangesAsync(ct);
        }

        if (await db.Categories.AnyAsync(ct))
            return;

        var starters = Category("پیش‌غذا", "شروع سبک سفره", 1);
        var mains = Category("غذای اصلی", "چلو، کباب و خورشت", 2);
        var drinks = Category("نوشیدنی", "سرد و گرم", 3);
        var desserts = Category("دسر", "شیرینی آخر غذا", 4);

        db.Categories.AddRange(starters, mains, drinks, desserts);
        db.MenuItems.AddRange(
            Item(starters, "سالاد شیرازی", "خیار، گوجه، پیاز و آبغوره", 95000),
            Item(starters, "کشک بادمجان", "بادمجان کبابی با کشک و نعنا داغ", 165000),
            Item(starters, "میرزا قاسمی", "بادمجان و گوجه با سیر تازه", 155000),
            Item(mains, "چلو کباب کوبیده", "دو سیخ کوبیده با برنج ایرانی و کره", 345000),
            Item(mains, "چلو جوجه زعفرانی", "سینه مرغ زعفرانی با دورچین", 365000),
            Item(mains, "قورمه سبزی", "خورشت سبزی با لوبیا قرمز و گوشت", 280000),
            Item(mains, "زرشک پلو با مرغ", "ران مرغ، زرشک و خلال پسته", 295000),
            Item(drinks, "دوغ محلی", "دوغ خیار و نعنا", 45000),
            Item(drinks, "چای زعفران", "چای تازه دم با زعفران", 35000),
            Item(drinks, "شربت بیدمشک", "سرد، با یخ و عرق بیدمشک", 55000),
            Item(desserts, "فالوده شیرازی", "نشاسته، آبلیمو و گلاب", 98000),
            Item(desserts, "باقلوا", "دو عدد باقلوا پسته‌ای", 120000));

        await db.SaveChangesAsync(ct);
    }

    private static User CreateUser(IPasswordHasher<User> hasher, string name, string email, string password, UserRole role)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = name,
            Email = email,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = hasher.HashPassword(user, password);
        return user;
    }

    private static Category Category(string name, string description, int sortOrder) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Description = description,
        SortOrder = sortOrder
    };

    private static MenuItem Item(Category category, string name, string description, decimal price) => new()
    {
        Id = Guid.NewGuid(),
        CategoryId = category.Id,
        Name = name,
        Description = description,
        Price = price,
        IsAvailable = true
    };
}
