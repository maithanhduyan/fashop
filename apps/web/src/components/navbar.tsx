"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/products" className="hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>
        Sản phẩm
      </Link>

      {user ? (
        <>
          <Link href="/cart" className="relative hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>
            Giỏ hàng
            {itemCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
          <Link href="/orders" className="hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>
            Đơn hàng
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className="font-medium text-blue-600 hover:text-blue-500" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          <span className="text-zinc-400 text-xs sm:text-sm truncate max-w-[120px]">{user.email}</span>
          <button onClick={() => { logout(); setMenuOpen(false); }} className="text-red-500 hover:text-red-400 transition-colors">
            Đăng xuất
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="hover:text-blue-600 transition-colors" onClick={() => setMenuOpen(false)}>
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-black px-4 py-1.5 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Đăng ký
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-blue-600">F</span>ashop
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 text-sm md:flex">
          {navLinks}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          aria-label="Menu"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="animate-slide-down border-t border-zinc-200 bg-white px-4 pb-4 pt-2 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {navLinks}
          </div>
        </div>
      )}
    </header>
  );
}
