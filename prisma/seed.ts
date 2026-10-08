import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

try {
  process.loadEnvFile(".env");
} catch {}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const img = (label: string) =>
  `https://placehold.co/800x800/0f172a/e2e8f0/png?text=${encodeURIComponent(label)}`;

const categories = [
  { name: "Smartphones", slug: "smartphones" },
  { name: "Laptops", slug: "laptops" },
  { name: "Smart Devices", slug: "smart-devices" },
  { name: "Accessories", slug: "accessories" },
];

// price in LKR; category refers to the slug above
const products = [
  { name: "Galaxy S25 256GB", category: "smartphones", price: "329000.00", stock: 15, description: "A fast Samsung phone with a bright screen and a great camera. Comes in black." },
  { name: "iPhone 16 128GB", category: "smartphones", price: "349000.00", stock: 12, description: "A smooth Apple iPhone with a sharp camera and long battery life. Available in white." },
  { name: "Pixel 9a", category: "smartphones", price: "199000.00", stock: 20, description: "A simple Google phone with a clean look and a very good camera. Comes in grey." },
  { name: "Redmi Note 14 Pro", category: "smartphones", price: "104500.00", stock: 30, description: "A budget-friendly phone with a big screen and fast charging. Available in blue." },
  { name: "MacBook Air 13 M3", category: "laptops", price: "429000.00", stock: 8, description: "A thin and light Apple laptop that is quick and lasts all day. Comes in silver." },
  { name: "Dell XPS 14", category: "laptops", price: "489000.00", stock: 6, description: "A stylish Dell laptop with a sharp screen, good for work and study." },
  { name: "ASUS TUF Gaming F15", category: "laptops", price: "329500.00", stock: 10, description: "A strong gaming laptop that runs games and heavy apps smoothly." },
  { name: "Lenovo IdeaPad Slim 3", category: "laptops", price: "174900.00", stock: 18, description: "A reliable everyday laptop for school, office work and browsing. Comes in grey." },
  { name: "Apple Watch Series 10", category: "smart-devices", price: "139000.00", stock: 14, description: "A smartwatch that tracks your steps, health and workouts. Available in black." },
  { name: "Echo Dot (5th Gen)", category: "smart-devices", price: "19900.00", stock: 40, description: "A small smart speaker you can control with your voice. Comes in white." },
  { name: "Xiaomi Smart Band 9", category: "smart-devices", price: "15900.00", stock: 50, description: "A light fitness band that tracks your steps and sleep. Available in black." },
  { name: "AirPods Pro 2", category: "accessories", price: "84900.00", stock: 25, description: "Wireless earbuds with clear sound and noise cancelling. Comes in white." },
  { name: "Anker 65W GaN Charger", category: "accessories", price: "12900.00", stock: 60, description: "A small, fast charger for your phone and laptop. Comes in black." },
  { name: "Logitech MX Master 3S", category: "accessories", price: "36900.00", stock: 0, description: "A comfortable wireless mouse for work and everyday use. Available in graphite." },
];

async function main() {
  const categoryIds = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name }, create: c });
    categoryIds.set(c.slug, row.id);
  }

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: img(p.name),
      categoryId: categoryIds.get(p.category)!,
    };
    await prisma.product.upsert({ where: { slug }, update: data, create: { slug, ...data } });
  }

  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@technova.lk").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const passwordHash = await bcrypt.hash(password, 12);
  // update keeps the existing hash unless you re-run with a new password on purpose
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { name: "TechNova Admin", email, passwordHash, role: "ADMIN" },
  });

  console.log(`Seeded ${categories.length} categories, ${products.length} products, admin ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
