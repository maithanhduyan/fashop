"use client";

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
      router.push("/cart");
    } catch {
      alert("Không thể thêm vào giỏ hàng");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="py-20 text-center text-zinc-400">Đang tải...</div>;
  if (!product) return <div className="py-20 text-center text-zinc-400">Sản phẩm không tồn tại</div>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {product.image_urls?.[0] ? (
          <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">No image</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-2xl font-bold text-red-600">{formatPrice(product.price)}</p>

        {product.description && (
          <p className="text-zinc-600 dark:text-zinc-400">{product.description}</p>
        )}

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Số lượng:</label>
          <div className="flex items-center rounded border border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty(Math.min(99, qty + 1))}
              className="px-3 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="mt-2 w-full rounded-md bg-black py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto sm:px-8"
        >
          {adding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  );
}
