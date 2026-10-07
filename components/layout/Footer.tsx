"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const columns = [
  {
    title: "Quick Links",
    links: [
      { href: "/", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/cart", label: "Cart" },
    ],
  },
  {
    title: "Shop by category",
    links: [
      { href: "/products?category=smartphones", label: "Smartphones" },
      { href: "/products?category=laptops", label: "Laptops" },
      { href: "/products?category=smart-devices", label: "Smart Devices" },
      { href: "/products?category=accessories", label: "Accessories" },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-20 bg-ink-900 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Logo href={null} onDark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Genuine smartphones, laptops, smart devices and accessories, delivered across Sri Lanka.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-white">{col.title}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-400 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} TechNova. Built for the DartCodes technical assessment.
        </p>
      </div>
    </footer>
  );
}
