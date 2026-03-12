"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, updateItem, removeItem } = useCart();

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-zinc-500">Vui lòng đăng nhập để xem giỏ hàng</p>
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) return <div className="py-20 text-center text-zinc-400">Đang tải...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Giỏ hàng</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="mb-4 text-zinc-500">Giỏ hàng trống</p>
          <Link href="/products" className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-900">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-300">No img</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/products/${item.product_slug}`} className="font-medium hover:text-blue-600">
                      {item.product_name}
                    </Link>
                    <p className="text-sm font-semibold text-red-600">{formatPrice(item.product_price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded border border-zinc-300 dark:border-zinc-700">
                      <button
                        onClick={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-400">
                      Xoá
                    </button>
                    <span className="ml-auto text-sm font-medium">
                      {formatPrice(item.product_price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="mb-4 text-lg font-semibold">Tổng đơn hàng</h2>
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg font-bold dark:border-zinc-700">
              <span>Tổng cộng</span>
              <span className="text-red-600">{formatPrice(cart.total)}</span>
            </div>
            <Link
              href="/checkout"
              className="mt-4 block w-full rounded-md bg-black py-3 text-center text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Thanh toán →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
