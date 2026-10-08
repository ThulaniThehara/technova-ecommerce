import { Headphones, Laptop, Smartphone, Watch, type LucideIcon } from "lucide-react";

// One icon per category slug, shared by the hero shortcuts and the "Shop by category" tiles.
export const categoryIcons: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  "smart-devices": Watch,
  accessories: Headphones,
};

export const fallbackCategoryIcon: LucideIcon = Headphones;

// Display order everywhere (hero chips, home tiles, products filter): the main categories first,
// in this order, then any category added later in alphabetical order.
const ORDER = Object.keys(categoryIcons);

export function sortCategories<T extends { slug: string; name: string }>(categories: T[]): T[] {
  const rank = (slug: string) => {
    const i = ORDER.indexOf(slug);
    return i === -1 ? ORDER.length : i;
  };
  return [...categories].sort((a, b) => rank(a.slug) - rank(b.slug) || a.name.localeCompare(b.name));
}
