"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { PaginatedOrders } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .getOrders()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-zinc-500">Vui lòng đăng nhập</p>
        <Link href="/login" className="rounded-md bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) return <div className="py-20 text-center text-zinc-400">Đang tải...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Đơn hàng của bạn</h1>

      {!data || data.data.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">Chưa có đơn hàng nào</div>
      ) : (
        <div className="space-y-4">
          {data.data.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-zinc-200 p-4 hover:shadow-md dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-zinc-500">Đơn #{order.id}</span>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || ""}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
