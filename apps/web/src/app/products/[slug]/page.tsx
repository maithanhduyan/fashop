"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as api from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    api
      .getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      alert("Không thể thêm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <span className="text-4xl">😔</span>
        <p className="mt-3 text-zinc-500">Sản phẩm không tồn tại</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500">
          ← Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="animate-fade-in mb-6 text-sm text-zinc-500">
        <Link href="/products" className="hover:text-blue-600 transition-colors">Sản phẩm</Link>
        <span className="mx-2">›</span>
        <span className="text-zinc-800 dark:text-zinc-200">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="animate-fade-in aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          {product.image_urls?.[0] ? (
            <img src={product.image_urls[0]} alt={product.name} className="img-zoom h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300">No image</div>
          )}
        </div>

        {/* Info */}
        <div className="animate-fade-in-up flex flex-col gap-5">
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <p className="text-3xl font-extrabold text-red-500">{formatPrice(product.price)}</p>

          {product.description && (
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{product.description}</p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Số lượng:</label>
            <div className="flex items-center overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3.5 py-2 text-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                −
              </button>
              <span className="w-12 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty(Math.min(99, qty + 1))}
                className="px-3.5 py-2 text-lg transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={`flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all sm:px-8 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
              } disabled:opacity-50`}
            >
              {added ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Đã thêm!
                </>
              ) : adding ? (
                "Đang thêm..."
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Thêm vào giỏ hàng
                </>
              )}
            </button>
            {added && (
              <Link
                href="/cart"
                className="flex items-center justify-center rounded-full border-2 border-blue-600 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-900/20 sm:px-8"
              >
                Xem giỏ hàng →
              </Link>
            )}
          </div>

          {/* Extra info */}
          <div className="mt-4 space-y-3 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span>🚚</span> Miễn phí giao hàng cho đơn từ 500.000đ
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span>🔄</span> Đổi trả miễn phí trong 30 ngày
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span>✅</span> Cam kết hàng chính hãng 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
