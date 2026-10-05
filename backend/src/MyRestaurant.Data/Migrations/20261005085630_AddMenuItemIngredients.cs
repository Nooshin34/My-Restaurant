using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyRestaurant.Data.Migrations;

/// <inheritdoc />
public partial class _20261005085630_AddMenuItemIngredients : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Ingredients",
            table: "MenuItems",
            type: "nvarchar(1000)",
            maxLength: 1000,
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Ingredients",
            table: "MenuItems");
    }
}
