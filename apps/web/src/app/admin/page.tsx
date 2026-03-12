"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, getCategories, adminGetOrders } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  pendingOrders: number;
}

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, categories, orders] = await Promise.all([
          getProducts({ limit: 1 }),
          getCategories(),
          adminGetOrders({ limit: 5 }),
        ]);

        const allOrders = await adminGetOrders({ limit: 100 });

        setStats({
          totalProducts: products.total,
          totalOrders: allOrders.total,
          totalCategories: categories.length,
          totalRevenue: allOrders.data.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0),
          pendingOrders: allOrders.data.filter((o) => o.status === "pending").length,
        });
        setRecentOrders(orders.data);
      } catch {
        // Silently fail — layout will redirect non-admin users
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Tổng sản phẩm",
      value: stats?.totalProducts ?? 0,
      icon: "📦",
      color: "from-blue-500 to-blue-600",
      href: "/admin/products",
    },
    {
      label: "Tổng đơn hàng",
      value: stats?.totalOrders ?? 0,
      icon: "🛒",
      color: "from-emerald-500 to-emerald-600",
      href: "/admin/orders",
    },
    {
      label: "Chờ xử lý",
      value: stats?.pendingOrders ?? 0,
      icon: "⏳",
      color: "from-amber-500 to-amber-600",
      href: "/admin/orders?status=pending",
    },
    {
      label: "Doanh thu",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: "💰",
      color: "from-violet-500 to-violet-600",
      href: "/admin/orders?status=delivered",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tổng quan hệ thống Fashop
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className="animate-fade-in-up group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`absolute top-0 right-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-linear-to-br ${card.color} opacity-10 transition-transform group-hover:scale-125`} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Đơn hàng gần đây</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
            Chưa có đơn hàng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-6 py-3 font-medium">Mã đơn</th>
                  <th className="px-6 py-3 font-medium">Khách hàng</th>
                  <th className="px-6 py-3 font-medium">Tổng tiền</th>
                  <th className="px-6 py-3 font-medium">Trạng thái</th>
                  <th className="px-6 py-3 font-medium">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
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
                    <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">{order.shipping_name}</td>
                    <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            📦
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Quản lý sản phẩm</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Thêm, sửa, xoá sản phẩm</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
            🛒
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Quản lý đơn hàng</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Xem, cập nhật trạng thái</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
            📋
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Quản lý danh mục</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Thêm, sửa, xoá danh mục</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
