"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import type { Category, PaginatedProducts } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsSkeleton() {
  return (
    <div className="py-8">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-6 flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="aspect-square animate-pulse bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
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
      <h1 className="animate-fade-in mb-2 text-2xl font-bold">Sản phẩm</h1>
      {data && !loading && (
        <p className="animate-fade-in mb-6 text-sm text-zinc-500">{data.total} sản phẩm</p>
      )}

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-sm transition-all ${!categoryId ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700"}`}
        >
          Tất cả
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.id}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-all ${categoryId === cat.id ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700"}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {loading ? (
        <ProductsSkeleton />
      ) : !data || data.data.length === 0 ? (
        <div className="py-20 text-center">
          <span className="text-4xl">🔍</span>
          <p className="mt-3 text-zinc-500">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.data.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="product-card animate-fade-in-up group overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                style={{ animationDelay: `${i * 0.05}s` }}
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

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?page=${p}${categoryId ? `&category=${categoryId}` : ""}${search ? `&q=${search}` : ""}`}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${p === page ? "bg-blue-600 text-white shadow-sm" : "border border-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-500"}`}
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
