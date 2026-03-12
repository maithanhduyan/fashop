"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import type { Category, PaginatedProducts } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get("page") || 1);
  const categoryId = searchParams.get("category") ? Number(searchParams.get("category")) : undefined;
  const search = searchParams.get("q") || undefined;

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getProducts({ page, limit: 12, category_id: categoryId, search })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, categoryId, search]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Sản phẩm</h1>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-sm ${!categoryId ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700"}`}
        >
          Tất cả
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${categoryId === cat.id ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700"}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-zinc-400">Đang tải...</div>
      ) : !data || data.data.length === 0 ? (
        <div className="py-20 text-center text-zinc-400">Không có sản phẩm nào</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.data.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group overflow-hidden rounded-lg border border-zinc-200 transition hover:shadow-md dark:border-zinc-800"
              >
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-900">
                  {p.image_urls?.[0] ? (
                    <img src={p.image_urls[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-300">No image</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium group-hover:text-blue-600">{p.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-red-600">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?page=${p}${categoryId ? `&category=${categoryId}` : ""}${search ? `&q=${search}` : ""}`}
                  className={`rounded px-3 py-1 text-sm ${p === page ? "bg-black text-white dark:bg-white dark:text-black" : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
