import { Cpu } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Cpu className="h-5 w-5" aria-hidden />
            </span>
            TechNova
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            Smartphones, laptops, smart devices and accessories - genuine products, delivered island-wide.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Shop</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white">All products</Link></li>
            <li><Link href="/products?category=smartphones" className="hover:text-white">Smartphones</Link></li>
            <li><Link href="/products?category=laptops" className="hover:text-white">Laptops</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Order with us</h2>
          <p className="mt-3 text-sm text-slate-400">
            Pay online with PayHere or send your cart to us on WhatsApp at checkout.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} TechNova. Built for the DartCodes technical assessment.
      </div>
    </footer>
  );
}
