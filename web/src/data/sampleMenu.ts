import type { Category, MenuItem } from "../api/types.ts";

const starters = "starters";
const mains = "mains";
const drinks = "drinks";
const desserts = "desserts";

export const sampleCategories: Category[] = [
  { id: starters, name: "پیش‌غذا", description: "شروع سبک سفره", sortOrder: 1 },
  { id: mains, name: "غذای اصلی", description: "چلو، کباب و خورشت", sortOrder: 2 },
  { id: drinks, name: "نوشیدنی", description: "سرد و گرم", sortOrder: 3 },
  { id: desserts, name: "دسر", description: "شیرینی آخر غذا", sortOrder: 4 },
];

function dish(
  categoryId: string,
  categoryName: string,
  id: string,
  name: string,
  price: number,
  description: string,
  ingredients: string,
  image: string,
): MenuItem {
  return {
    id,
    categoryId,
    categoryName,
    name,
    description,
    ingredients,
    price,
    isAvailable: true,
    imageUrl: `images/${image}`,
  };
}

export const sampleItems: MenuItem[] = [
  dish(starters, "پیش‌غذا", "shirazi-salad", "سالاد شیرازی", 95000, "سالاد خردشده با آبغوره", "خیار خردشده، گوجه فرنگی، پیاز قرمز، آبغوره، روغن زیتون، نمک و نعنا خشک.", "shirazi-salad.jpg"),
  dish(starters, "پیش‌غذا", "kashk-bademjan", "کشک بادمجان", 165000, "بادمجان کبابی با کشک", "بادمجان کبابی له شده، کشک، نعنا داغ، سیر داغ، پیاز داغ، گردو و روغن حیوانی.", "kashk-bademjan.jpg"),
  dish(starters, "پیش‌غذا", "mirza-ghasemi", "میرزا قاسمی", 155000, "بادمجان دودی با گوجه و تخم مرغ", "بادمجان دودی، گوجه فرنگی، سیر تازه، تخم مرغ، روغن زیتون و نمک.", "mirza-ghasemi.jpg"),
  dish(mains, "غذای اصلی", "koobideh", "چلو کباب کوبیده", 345000, "دو سیخ کوبیده با برنج ایرانی", "گوشت گوسفندی چرخ کرده، پیاز رنده شده، برنج ایرانی، کره، زعفران، گوجه کبابی و سماق.", "koobideh.jpg"),
  dish(mains, "غذای اصلی", "joojeh", "چلو جوجه زعفرانی", 365000, "مرغ زعفرانی با دورچین", "سینه مرغ، زعفران دم کرده، آبلیمو، روغن زیتون، برنج ایرانی، کره و فلفل دلمه‌ای.", "joojeh.jpg"),
  dish(mains, "غذای اصلی", "ghormeh-sabzi", "قورمه سبزی", 280000, "خورشت سبزی با لوبیا و گوشت", "سبزی قورمه شامل تره، جعفری، شنبلیله و گشنیز، لوبیا قرمز، گوشت گوسفندی، پیاز، لیمو عمانی و روغن.", "ghormeh-sabzi.jpg"),
  dish(mains, "غذای اصلی", "zereshk-polo", "زرشک پلو با مرغ", 295000, "ران مرغ با زرشک و پسته", "ران مرغ، برنج ایرانی، زرشک، خلال پسته، زعفران، شکر و کره.", "zereshk-polo.jpg"),
  dish(drinks, "نوشیدنی", "doogh", "دوغ محلی", 45000, "دوغ خیار و نعنا", "ماست، آب، خیار رنده شده، نعنا خشک، نمک و گل سرخ.", "doogh.jpg"),
  dish(drinks, "نوشیدنی", "saffron-tea", "چای زعفران", 35000, "چای تازه دم با زعفران", "چای سیاه دم کشیده، زعفران دم کرده، هل و نبات.", "saffron-tea.jpg"),
  dish(drinks, "نوشیدنی", "bidmeshk", "شربت بیدمشک", 55000, "شربت سرد با عرق بیدمشک", "عرق بیدمشک، شکر، آب، یخ و گلاب.", "bidmeshk.jpg"),
  dish(desserts, "دسر", "faloodeh", "فالوده شیرازی", 98000, "رشته نشاسته با آبلیمو و گلاب", "نشاسته رشته شده، آبلیمو، گلاب، شکر و یخ خرد شده.", "faloodeh.jpg"),
  dish(desserts, "دسر", "baklava", "باقلوا", 120000, "دو عدد باقلوا پسته‌ای", "آرد، مغز پسته، شکر، گلاب، روغن و هل.", "baklava.jpg"),
];
