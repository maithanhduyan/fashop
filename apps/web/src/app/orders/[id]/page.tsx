"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { Order } from "@/lib/types";
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    api
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (!user) return null;
  if (loading) return <div className="py-20 text-center text-zinc-400">Đang tải...</div>;
  if (!order) return <div className="py-20 text-center text-zinc-400">Đơn hàng không tồn tại</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/orders" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
        ← Quay lại
      </Link>

      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Đơn hàng #{order.id}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] || ""}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p><strong>Người nhận:</strong> {order.shipping_name}</p>
          <p><strong>SĐT:</strong> {order.shipping_phone}</p>
          <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
          {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
          <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString("vi-VN")}</p>
        </div>

        {/* Items */}
        <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <h2 className="mb-3 font-semibold">Sản phẩm</h2>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-lg font-bold dark:border-zinc-700">
            <span>Tổng cộng</span>
            <span className="text-red-600">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
