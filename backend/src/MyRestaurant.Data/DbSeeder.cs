using Microsoft.EntityFrameworkCore;
using MyRestaurant.Business.Interfaces;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Data;

public static class DbSeeder
{
    public const string AdminEmail = "admin@myrestaurant.local";
    public const string AdminPassword = "Admin123!";
    public const string CustomerEmail = "customer@myrestaurant.local";
    public const string CustomerPassword = "Customer123!";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher hasher, CancellationToken ct = default)
    {
        if (!await db.Users.AnyAsync(ct))
        {
            db.Users.Add(CreateUser(hasher, "مدیر رستوران", AdminEmail, AdminPassword, UserRole.Admin));
            db.Users.Add(CreateUser(hasher, "مهمان نمونه", CustomerEmail, CustomerPassword, UserRole.Customer));
            await db.SaveChangesAsync(ct);
        }

        if (!await db.Categories.AnyAsync(ct))
        {
            var starters = Category("پیش‌غذا", "شروع سبک سفره", 1);
            var mains = Category("غذای اصلی", "چلو، کباب و خورشت", 2);
            var drinks = Category("نوشیدنی", "سرد و گرم", 3);
            var desserts = Category("دسر", "شیرینی آخر غذا", 4);

            db.Categories.AddRange(starters, mains, drinks, desserts);
            db.MenuItems.AddRange(
                Item(starters, "سالاد شیرازی", 95000),
                Item(starters, "کشک بادمجان", 165000),
                Item(starters, "میرزا قاسمی", 155000),
                Item(mains, "چلو کباب کوبیده", 345000),
                Item(mains, "چلو جوجه زعفرانی", 365000),
                Item(mains, "قورمه سبزی", 280000),
                Item(mains, "زرشک پلو با مرغ", 295000),
                Item(drinks, "دوغ محلی", 45000),
                Item(drinks, "چای زعفران", 35000),
                Item(drinks, "شربت بیدمشک", 55000),
                Item(desserts, "فالوده شیرازی", 98000),
                Item(desserts, "باقلوا", 120000));

            await db.SaveChangesAsync(ct);
        }

        await ApplyDishDetailsAsync(db, ct);
    }

    private static async Task ApplyDishDetailsAsync(AppDbContext db, CancellationToken ct)
    {
        var items = await db.MenuItems.ToListAsync(ct);
        foreach (var item in items)
        {
            if (!Dishes.TryGetValue(item.Name, out var detail))
                continue;

            item.Description = detail.Description;
            item.Ingredients = detail.Ingredients;
            item.ImageUrl = detail.ImageUrl;
        }

        await db.SaveChangesAsync(ct);
    }

    private static User CreateUser(IPasswordHasher hasher, string name, string email, string password, UserRole role)
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = name,
            Email = email,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = hasher.Hash(user, password);
        return user;
    }

    private static Category Category(string name, string description, int sortOrder) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Description = description,
        SortOrder = sortOrder
    };

    private static MenuItem Item(Category category, string name, decimal price)
    {
        var detail = Dishes[name];
        return new MenuItem
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Name = name,
            Description = detail.Description,
            Ingredients = detail.Ingredients,
            ImageUrl = detail.ImageUrl,
            Price = price,
            IsAvailable = true
        };
    }

    private static readonly Dictionary<string, DishDetail> Dishes = new()
    {
        ["سالاد شیرازی"] = new("سالاد خردشده با آبغوره", "خیار خردشده، گوجه فرنگی، پیاز قرمز، آبغوره، روغن زیتون، نمک و نعنا خشک.", "/images/shirazi-salad.jpg"),
        ["کشک بادمجان"] = new("بادمجان کبابی با کشک", "بادمجان کبابی له شده، کشک، نعنا داغ، سیر داغ، پیاز داغ، گردو و روغن حیوانی.", "/images/kashk-bademjan.jpg"),
        ["میرزا قاسمی"] = new("بادمجان دودی با گوجه و تخم مرغ", "بادمجان دودی، گوجه فرنگی، سیر تازه، تخم مرغ، روغن زیتون و نمک.", "/images/mirza-ghasemi.jpg"),
        ["چلو کباب کوبیده"] = new("دو سیخ کوبیده با برنج ایرانی", "گوشت گوسفندی چرخ کرده، پیاز رنده شده، برنج ایرانی، کره، زعفران، گوجه کبابی و سماق.", "/images/koobideh.jpg"),
        ["چلو جوجه زعفرانی"] = new("مرغ زعفرانی با دورچین", "سینه مرغ، زعفران دم کرده، آبلیمو، روغن زیتون، برنج ایرانی، کره و فلفل دلمه‌ای.", "/images/joojeh.jpg"),
        ["قورمه سبزی"] = new("خورشت سبزی با لوبیا و گوشت", "سبزی قورمه شامل تره، جعفری، شنبلیله و گشنیز، لوبیا قرمز، گوشت گوسفندی، پیاز، لیمو عمانی و روغن.", "/images/ghormeh-sabzi.jpg"),
        ["زرشک پلو با مرغ"] = new("ران مرغ با زرشک و پسته", "ران مرغ، برنج ایرانی، زرشک، خلال پسته، زعفران، شکر و کره.", "/images/zereshk-polo.jpg"),
        ["دوغ محلی"] = new("دوغ خیار و نعنا", "ماست، آب، خیار رنده شده، نعنا خشک، نمک و گل سرخ.", "/images/doogh.jpg"),
        ["چای زعفران"] = new("چای تازه دم با زعفران", "چای سیاه دم کشیده، زعفران دم کرده، هل و نبات.", "/images/saffron-tea.jpg"),
        ["شربت بیدمشک"] = new("شربت سرد با عرق بیدمشک", "عرق بیدمشک، شکر، آب، یخ و گلاب.", "/images/bidmeshk.jpg"),
        ["فالوده شیرازی"] = new("رشته نشاسته با آبلیمو و گلاب", "نشاسته رشته شده، آبلیمو، گلاب، شکر و یخ خرد شده.", "/images/faloodeh.jpg"),
        ["باقلوا"] = new("دو عدد باقلوا پسته‌ای", "آرد، مغز پسته، شکر، گلاب، روغن و هل.", "/images/baklava.jpg")
    };

    private sealed record DishDetail(string Description, string Ingredients, string ImageUrl);
}
