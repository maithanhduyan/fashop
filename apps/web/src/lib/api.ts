import type { AuthResponse, Cart, Category, Order, PaginatedOrders, PaginatedProducts, Product } from "./types";

function getApiUrl(): string {
  // On client-side: detect Railway production by hostname
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".up.railway.app")) {
    return "https://api-production-67a6.up.railway.app";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiUrl()}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || "Request failed");
  }

  if (res.status === 204) return null as T;
  return res.json();
}

// Auth
export async function register(email: string, password: string): Promise<AuthResponse> {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  return request("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
  });
}

export async function getMe() {
  return request<{ id: number; email: string; role: string }>("/api/v1/me");
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return request("/api/v1/categories");
}

// Products
export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<PaginatedProducts> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.category_id) sp.set("category_id", String(params.category_id));
  if (params?.search) sp.set("search", params.search);
  if (params?.sort_by) sp.set("sort_by", params.sort_by);
  if (params?.sort_order) sp.set("sort_order", params.sort_order);
  return request(`/api/v1/products?${sp.toString()}`);
}

export async function getProduct(id: number): Promise<Product> {
  return request(`/api/v1/products/${id}`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return request(`/api/v1/products/slug/${slug}`);
}

// Cart
export async function getCart(): Promise<Cart> {
  return request("/api/v1/cart");
}

export async function addToCart(product_id: number, quantity: number): Promise<void> {
  return request("/api/v1/cart", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity }),
  });
}

export async function updateCartItem(id: number, quantity: number): Promise<void> {
  return request(`/api/v1/cart/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(id: number): Promise<void> {
  return request(`/api/v1/cart/${id}`, { method: "DELETE" });
}

export async function clearCart(): Promise<void> {
  return request("/api/v1/cart", { method: "DELETE" });
}

// Orders
export async function checkout(data: {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  note?: string;
}): Promise<Order> {
  return request("/api/v1/orders/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrders(page = 1, limit = 20): Promise<PaginatedOrders> {
  return request(`/api/v1/orders?page=${page}&limit=${limit}`);
}

export async function getOrder(id: number): Promise<Order> {
  return request(`/api/v1/orders/${id}`);
}

// ── Admin: Products ──

export async function adminCreateProduct(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  category_id?: number;
  image_urls?: string[];
  status?: string;
}): Promise<Product> {
  return request("/api/v1/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateProduct(
  id: number,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    category_id?: number;
    image_urls?: string[];
    status?: string;
  },
): Promise<Product> {
  return request(`/api/v1/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteProduct(id: number): Promise<void> {
  return request(`/api/v1/admin/products/${id}`, { method: "DELETE" });
}

// ── Admin: Categories ──

export async function adminCreateCategory(data: { name: string; slug: string }): Promise<Category> {
  return request("/api/v1/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCategory(id: number, data: { name: string; slug: string }): Promise<Category> {
  return request(`/api/v1/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCategory(id: number): Promise<void> {
  return request(`/api/v1/admin/categories/${id}`, { method: "DELETE" });
}

// ── Admin: Orders ──

export async function adminGetOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedOrders> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.status) sp.set("status", params.status);
  return request(`/api/v1/admin/orders?${sp.toString()}`);
}

export async function adminGetOrder(id: number): Promise<Order> {
  return request(`/api/v1/admin/orders/${id}`);
}

export async function adminUpdateOrderStatus(id: number, status: string): Promise<Order> {
  return request(`/api/v1/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export { ApiError };
