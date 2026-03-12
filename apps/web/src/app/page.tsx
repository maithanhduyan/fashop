"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getProducts({ page: 1, limit: 8, sort_by: "created_at", sort_order: "desc" }).then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  return (
    <div className="-mx-4 -mt-6 sm:-mt-8">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&q=60')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center text-white sm:py-32">
          <span className="animate-fade-in inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur">
            New Collection 2026
          </span>
          <h1 className="animate-fade-in-up text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Thời trang <span className="text-yellow-300">Fashop</span>
          </h1>
          <p className="animate-fade-in-up delay-100 max-w-lg text-lg text-blue-100">
            Khám phá bộ sưu tập mới nhất — phong cách hiện đại, chất lượng cao, giá tốt nhất thị trường.
          </p>
          <div className="animate-fade-in-up delay-200 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/products"
              className="rounded-full bg-white px-8 py-3 text-center text-sm font-semibold text-blue-700 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              Mua sắm ngay →
            </Link>
            <Link
              href="/products?sort_by=price&sort_order=asc"
              className="rounded-full border-2 border-white/40 px-8 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:border-white hover:bg-white/10"
            >
              Ưu đãi hot 🔥
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features bar ── */}
      <section className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 text-center text-sm sm:grid-cols-4">
          {[
            { icon: "🚚", title: "Miễn phí giao hàng", desc: "Đơn từ 500K" },
            { icon: "🔄", title: "Đổi trả 30 ngày", desc: "Không lo rủi ro" },
            { icon: "💳", title: "Thanh toán an toàn", desc: "SSL & bảo mật" },
            { icon: "📞", title: "Hỗ trợ 24/7", desc: "Hotline 1900-6868" },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{f.icon}</span>
              <span className="font-semibold">{f.title}</span>
              <span className="text-zinc-500 dark:text-zinc-400">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="animate-fade-in mb-8 text-center text-2xl font-bold">
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className={`animate-fade-in-up group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow transition hover:scale-[1.03] hover:shadow-lg ${categoryGradients[i % categoryGradients.length]}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="text-3xl">{categoryIcons[i % categoryIcons.length]}</span>
              <h3 className="mt-2 text-sm font-semibold sm:text-base">{cat.name}</h3>
              <span className="mt-1 inline-flex text-xs opacity-70 transition group-hover:opacity-100">
                Xem ngay →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="animate-fade-in text-2xl font-bold">Sản phẩm nổi bật</h2>
            <Link href="/products" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="product-card animate-fade-in-up group overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  {p.image_urls?.[0] ? (
                    <img src={p.image_urls[0]} alt={p.name} className="img-zoom h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">No image</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium transition group-hover:text-blue-600">{p.name}</h3>
                  <p className="mt-1 text-sm font-bold text-red-500">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter / CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="animate-fade-in text-2xl font-bold">Đừng bỏ lỡ ưu đãi</h2>
        <p className="animate-fade-in-up delay-100 mx-auto mt-2 max-w-md text-zinc-500 dark:text-zinc-400">
          Đăng ký nhận tin để cập nhật bộ sưu tập mới và mã giảm giá độc quyền.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="animate-fade-in-up delay-200 mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="Email của bạn..."
            className="flex-1 rounded-full border border-zinc-300 px-5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg"
          >
            Đăng ký
          </button>
        </form>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-4">
          <div>
            <h4 className="mb-3 text-base font-bold"><span className="text-blue-600">F</span>ashop</h4>
            <p className="text-zinc-500 dark:text-zinc-400">Thời trang chất lượng cao, phong cách hiện đại cho giới trẻ Việt Nam.</p>
          </div>
          <div>
            <h5 className="mb-3 font-semibold">Danh mục</h5>
            <div className="flex flex-col gap-2 text-zinc-500 dark:text-zinc-400">
              <Link href="/products?category=1" className="hover:text-blue-600 transition-colors">Áo nam</Link>
              <Link href="/products?category=2" className="hover:text-blue-600 transition-colors">Quần nam</Link>
              <Link href="/products?category=3" className="hover:text-blue-600 transition-colors">Áo nữ</Link>
              <Link href="/products?category=4" className="hover:text-blue-600 transition-colors">Váy & Đầm</Link>
            </div>
          </div>
          <div>
            <h5 className="mb-3 font-semibold">Hỗ trợ</h5>
            <div className="flex flex-col gap-2 text-zinc-500 dark:text-zinc-400">
              <span>Chính sách đổi trả</span>
              <span>Hướng dẫn chọn size</span>
              <span>Câu hỏi thường gặp</span>
              <span>Liên hệ</span>
            </div>
          </div>
          <div>
            <h5 className="mb-3 font-semibold">Liên hệ</h5>
            <div className="flex flex-col gap-2 text-zinc-500 dark:text-zinc-400">
              <span>📞 1900-6868</span>
              <span>✉️ hello@fashop.vn</span>
              <span>📍 TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-800">
          © 2026 Fashop. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const categoryGradients = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-pink-500 to-pink-700",
  "from-purple-500 to-purple-700",
  "from-orange-500 to-orange-700",
  "from-teal-500 to-teal-700",
  "from-amber-500 to-amber-700",
  "from-red-500 to-red-700",
];

const categoryIcons = ["👔", "👖", "👚", "👗", "👟", "👜", "⌚", "🏃"];
