"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Fashop
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-zinc-600 dark:hover:text-zinc-300">
            Sản phẩm
          </Link>

          {user ? (
            <>
              <Link href="/cart" className="relative hover:text-zinc-600 dark:hover:text-zinc-300">
                Giỏ hàng
                {itemCount > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                Đơn hàng
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="font-medium text-blue-600 hover:text-blue-500">
                  Admin
                </Link>
              )}
              <span className="text-zinc-400">{user.email}</span>
              <button onClick={logout} className="text-red-500 hover:text-red-400">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-600 dark:hover:text-zinc-300">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
