"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetOrder, adminUpdateOrderStatus } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

const STATUS_FLOW = ["pending", "confirmed", "shipping", "delivered"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const id = Number(params.id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminGetOrder(id)
      .then(setOrder)
      .catch(() => router.replace("/admin/orders"))
      .finally(() => setLoading(false));
  }, [id, router]);

  async function advanceStatus() {
    if (!order) return;
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    setUpdating(true);
    try {
      const updated = await adminUpdateOrderStatus(order.id, next);
      setOrder(updated);
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  }

  async function cancelOrder() {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await adminUpdateOrderStatus(order.id, "cancelled");
      setOrder(updated);
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) return null;

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1;
  const canCancel = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/admin/orders" className="hover:text-blue-600 dark:hover:text-blue-400">
          Đơn hàng
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">#{order.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Đơn hàng #{order.id}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tạo lúc {new Date(order.created_at).toLocaleString("vi-VN")}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[order.status] ?? ""}`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Progress bar */}
      {order.status !== "cancelled" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((s, i) => {
              const done = currentIdx >= i;
              const active = currentIdx === i;
              return (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                        done
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-200 text-zinc-400 dark:bg-zinc-700 dark:text-zinc-500"
                      } ${active ? "ring-4 ring-blue-200 dark:ring-blue-900" : ""}`}
                    >
                      {done && i < currentIdx ? "✓" : i + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        done ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500"
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 flex-1 rounded transition-colors ${
                        currentIdx > i ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order items */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Sản phẩm ({order.items?.length ?? 0})
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Tổng cộng</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Shipping info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Thông tin giao hàng</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Người nhận</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{order.shipping_name}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Số điện thoại</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{order.shipping_phone}</p>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400">Địa chỉ</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{order.shipping_address}</p>
              </div>
              {order.note && (
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Ghi chú</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{order.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">Hành động</h3>
            <div className="space-y-3">
              {canAdvance && (
                <button
                  onClick={advanceStatus}
                  disabled={updating}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating
                    ? "Đang xử lý..."
                    : `Chuyển → ${STATUS_LABELS[STATUS_FLOW[currentIdx + 1]]}`}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={cancelOrder}
                  disabled={updating}
                  className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {updating ? "Đang xử lý..." : "Huỷ đơn hàng"}
                </button>
              )}
              {!canAdvance && !canCancel && (
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Đơn hàng đã kết thúc
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
