import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.ts";
import type { Category, MenuItem } from "../api/types.ts";
import { useCart } from "../cart/CartContext.tsx";
import { formatPrice } from "../lib/format.ts";

export function MenuPage() {
  const { add } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<Category[]>("/api/categories"),
      api.get<MenuItem[]>("/api/menu-items", { params: { availableOnly: true } }),
    ])
      .then(([categoryResponse, itemResponse]) => {
        setCategories(categoryResponse.data);
        setItems(itemResponse.data);
      })
      .catch(() => setError("منو بارگذاری نشد. مطمئن شوید API روی پورت ۵۰۸۰ روشن است."));
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim();
    return items.filter((item) => {
      const matchesCategory = categoryId === "all" || item.categoryId === categoryId;
      const matchesQuery = needle.length === 0 || item.name.includes(needle) || (item.description ?? "").includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [items, categoryId, query]);

  const addItem = (item: MenuItem) => {
    add({ menuItemId: item.id, name: item.name, price: item.price });
    setAddedId(item.id);
    window.setTimeout(() => setAddedId((current) => (current === item.id ? "" : current)), 900);
  };

  return (
    <section>
      <div className="hero">
        <p className="eyebrow">سفره خانگی، سفارش آنلاین</p>
        <h1>غذا را انتخاب کنید، میز را رزرو کنید.</h1>
        <p>منوی امروز رستوران من: کباب، خورشت و دسر. قیمت‌ها به تومان است.</p>
      </div>

      <div className="toolbar">
        <div className="chips">
          <button type="button" className={categoryId === "all" ? "chip active" : "chip"} onClick={() => setCategoryId("all")}>
            همه
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={categoryId === category.id ? "chip active" : "chip"}
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی غذا" />
      </div>

      {error && <p className="alert">{error}</p>}
      {!error && items.length === 0 && <p className="muted">در حال چیدن سفره...</p>}

      <div className="grid">
        {visible.map((item) => (
          <article key={item.id} className="dish">
            <span className="kicker">{item.categoryName}</span>
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <div className="dish-foot">
              <strong>{formatPrice(item.price)}</strong>
              <button type="button" className="btn" onClick={() => addItem(item)}>
                {addedId === item.id ? "اضافه شد" : "افزودن"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
