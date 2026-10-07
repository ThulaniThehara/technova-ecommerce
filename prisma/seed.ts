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
  { name: "Galaxy S25 256GB", category: "smartphones", price: "329000.00", stock: 15, description: "6.2-inch Dynamic AMOLED display, flagship camera system and all-day battery in a compact body." },
  { name: "iPhone 16 128GB", category: "smartphones", price: "349000.00", stock: 12, description: "A18 chip, 48MP Fusion camera and a bright Super Retina XDR display." },
  { name: "Pixel 9a", category: "smartphones", price: "199000.00", stock: 20, description: "Clean Android experience with a great camera and seven years of updates." },
  { name: "Redmi Note 14 Pro", category: "smartphones", price: "104500.00", stock: 30, description: "200MP camera, 120Hz AMOLED screen and fast charging at a friendly price." },
  { name: "MacBook Air 13 M3", category: "laptops", price: "429000.00", stock: 8, description: "Fanless, ultra-light laptop with the M3 chip and up to 18 hours of battery life." },
  { name: "Dell XPS 14", category: "laptops", price: "489000.00", stock: 6, description: "14-inch OLED display, Intel Core Ultra processor and premium aluminium build." },
  { name: "ASUS TUF Gaming F15", category: "laptops", price: "329500.00", stock: 10, description: "RTX graphics, 144Hz display and military-grade durability for gaming and creation." },
  { name: "Lenovo IdeaPad Slim 3", category: "laptops", price: "174900.00", stock: 18, description: "Everyday laptop with a Ryzen 5 processor, 16GB RAM and 512GB SSD." },
  { name: "Apple Watch Series 10", category: "smart-devices", price: "139000.00", stock: 14, description: "Larger always-on display, fitness tracking and ECG in a thin, comfortable design." },
  { name: "Echo Dot (5th Gen)", category: "smart-devices", price: "19900.00", stock: 40, description: "Compact smart speaker with Alexa, improved bass and smart-home control." },
  { name: "Xiaomi Smart Band 9", category: "smart-devices", price: "15900.00", stock: 50, description: "AMOLED fitness band with heart-rate, sleep tracking and 21-day battery life." },
  { name: "AirPods Pro 2", category: "accessories", price: "84900.00", stock: 25, description: "Active noise cancellation, adaptive transparency and USB-C charging case." },
  { name: "Anker 65W GaN Charger", category: "accessories", price: "12900.00", stock: 60, description: "Compact 3-port fast charger for laptops, phones and tablets." },
  { name: "Logitech MX Master 3S", category: "accessories", price: "36900.00", stock: 0, description: "Ergonomic wireless mouse with silent clicks and precise 8K DPI tracking. (Seeded out of stock to demo stock handling.)" },
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
