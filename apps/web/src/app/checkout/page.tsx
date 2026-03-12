"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    note: "",
  });

  useEffect(() => {
    if (!user) router.push("/login");
    else if (cart && cart.items.length === 0) router.push("/cart");
  }, [user, cart, router]);

  if (!user || !cart || cart.items.length === 0) {
    return <div className="py-20 text-center text-zinc-400">Đang tải...</div>;
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const order = await api.checkout({
        ...form,
        note: form.note || undefined,
      });
      await refresh();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-bold">Thanh toán</h1>

        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium">Họ tên người nhận</label>
          <input
            required
            maxLength={255}
            value={form.shipping_name}
            onChange={(e) => update("shipping_name", e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
          <input
            required
            maxLength={20}
            value={form.shipping_phone}
            onChange={(e) => update("shipping_phone", e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Địa chỉ giao hàng</label>
          <textarea
            required
            rows={3}
            value={form.shipping_address}
            onChange={(e) => update("shipping_address", e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Ghi chú (tuỳ chọn)</label>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => update("note", e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </form>

      {/* Order summary */}
      <div className="h-fit rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 text-lg font-semibold">Đơn hàng của bạn</h2>
        <div className="space-y-2">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatPrice(item.product_price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-lg font-bold dark:border-zinc-700">
          <span>Tổng cộng</span>
          <span className="text-red-600">{formatPrice(cart.total)}</span>
        </div>
      </div>
    </div>
  );
}
