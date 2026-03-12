"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import ThemeToggle from "@/components/theme-toggle";

/* ── Icons ── */
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Close user dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Auto-focus search input when opened */
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          <span className="text-blue-600">F</span>ashop
        </Link>

        {/* Desktop: Sản phẩm */}
        <Link href="/products" className="hidden text-sm font-medium transition-colors hover:text-blue-600 md:block">
          Sản phẩm
        </Link>

        {/* Search bar — desktop (always visible) */}
        <form onSubmit={handleSearch} className="relative mx-auto hidden max-w-md flex-1 md:block">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:bg-zinc-900"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <SearchIcon />
          </button>
        </form>

        {/* Right-side icons */}
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Tìm kiếm"
          >
            <SearchIcon />
          </button>

          {/* Cart icon */}
          <Link
            href={user ? "/cart" : "/login"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Giỏ hàng"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User menu / Auth */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Tài khoản"
              >
                <UserIcon />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                  {/* User info header */}
                  <div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
                    <p className="truncate text-sm font-medium">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Tài khoản
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                    Đơn hàng
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Admin
                    </Link>
                  )}
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 md:inline-flex"
            >
              Đăng nhập
            </Link>
          )}

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-current transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile search bar (slides down) */}
      {searchOpen && (
        <div className="animate-slide-down border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-full border border-zinc-300 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:bg-zinc-900"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <SearchIcon />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="animate-slide-down border-t border-zinc-200 bg-white px-4 pb-4 pt-2 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/products" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Sản phẩm
            </Link>
            {user ? (
              <>
                <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Giỏ hàng
                  {itemCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{itemCount}</span>
                  )}
                </Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Đơn hàng
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-blue-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    Admin
                  </Link>
                )}
                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                <div className="px-3 py-2 text-xs text-zinc-400">{user.email}</div>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="rounded-lg px-3 py-2.5 text-left text-red-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 font-medium text-blue-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
