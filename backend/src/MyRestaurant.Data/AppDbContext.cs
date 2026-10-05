using Microsoft.EntityFrameworkCore;
using MyRestaurant.Business.Entities;

namespace MyRestaurant.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Reservation> Reservations => Set<Reservation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.FullName).HasMaxLength(120);
            entity.Property(user => user.Email).HasMaxLength(256);
            entity.Property(user => user.PasswordHash).HasMaxLength(500);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(category => category.Name).HasMaxLength(80);
            entity.Property(category => category.Description).HasMaxLength(400);
        });

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.Property(item => item.Name).HasMaxLength(120);
            entity.Property(item => item.Description).HasMaxLength(800);
            entity.Property(item => item.Ingredients).HasMaxLength(1000);
            entity.Property(item => item.Price).HasPrecision(18, 2);
            entity.Property(item => item.ImageUrl).HasMaxLength(500);
            entity.HasOne(item => item.Category)
                .WithMany(category => category.Items)
                .HasForeignKey(item => item.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(order => order.Total).HasPrecision(18, 2);
            entity.Property(order => order.Note).HasMaxLength(500);
            entity.HasOne(order => order.User)
                .WithMany()
                .HasForeignKey(order => order.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(item => item.ItemName).HasMaxLength(120);
            entity.Property(item => item.UnitPrice).HasPrecision(18, 2);
            entity.HasOne(item => item.Order)
                .WithMany(order => order.Items)
                .HasForeignKey(item => item.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(item => item.MenuItem)
                .WithMany()
                .HasForeignKey(item => item.MenuItemId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.Property(reservation => reservation.GuestName).HasMaxLength(120);
            entity.Property(reservation => reservation.Phone).HasMaxLength(30);
            entity.Property(reservation => reservation.Note).HasMaxLength(500);
            entity.HasOne(reservation => reservation.User)
                .WithMany()
                .HasForeignKey(reservation => reservation.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
