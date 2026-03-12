"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { adminGetOrders, adminUpdateOrderStatus } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipping: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  cancelled: "Đã hủy",
};

export default function AdminOrders() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const LIMIT = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders({
        page,
        limit: LIMIT,
        status: statusFilter || undefined,
      });
      setOrders(res.data);
      setTotal(res.total);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openStatusUpdate(order: Order) {
    setUpdatingOrder(order);
    setNewStatus(order.status);
  }

  async function handleStatusUpdate() {
    if (!updatingOrder || newStatus === updatingOrder.status) return;
    setSaving(true);
    try {
      await adminUpdateOrderStatus(updatingOrder.id, newStatus);
      setUpdatingOrder(null);
      load();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Đơn hàng</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{total} đơn hàng</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setStatusFilter(s.value);
              setPage(1);
            }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
            Không có đơn hàng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50 text-left text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-400">
                  <th className="px-6 py-3 font-medium">Mã đơn</th>
                  <th className="px-6 py-3 font-medium">Khách hàng</th>
                  <th className="hidden px-6 py-3 font-medium md:table-cell">SĐT</th>
                  <th className="px-6 py-3 font-medium">Tổng tiền</th>
                  <th className="px-6 py-3 font-medium">Trạng thái</th>
                  <th className="hidden px-6 py-3 font-medium sm:table-cell">Ngày tạo</th>
                  <th className="px-6 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">
                      {order.shipping_name}
                    </td>
                    <td className="hidden px-6 py-3 text-zinc-500 md:table-cell dark:text-zinc-400">
                      {order.shipping_phone}
                    </td>
                    <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? ""}`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="hidden px-6 py-3 text-zinc-500 sm:table-cell dark:text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="mr-2 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => openStatusUpdate(order)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ←
          </button>
          <span className="px-3 text-sm text-zinc-600 dark:text-zinc-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            →
          </button>
        </div>
      )}

      {/* ── Status Update Modal ── */}
      {updatingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Cập nhật trạng thái
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Đơn hàng #{updatingOrder.id} — {updatingOrder.shipping_name}
            </p>

            <div className="mt-4 space-y-2">
              {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                <label
                  key={s.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    newStatus === s.value
                      ? "border-blue-500 bg-blue-50/50 dark:border-blue-600 dark:bg-blue-950/30"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.value}
                    checked={newStatus === s.value}
                    onChange={() => setNewStatus(s.value)}
                    className="accent-blue-600"
                  />
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[s.value] ?? ""}`}
                  >
                    {s.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setUpdatingOrder(null)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Huỷ
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={saving || newStatus === updatingOrder.status}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
