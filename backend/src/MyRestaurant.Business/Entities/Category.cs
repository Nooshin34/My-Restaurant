namespace MyRestaurant.Business.Entities;

public class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public List<MenuItem> Items { get; set; } = [];
}
