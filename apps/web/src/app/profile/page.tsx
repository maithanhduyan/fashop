"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <h1 className="mb-6 text-2xl font-bold">Tài khoản</h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600 dark:bg-blue-900/30">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.email}</p>
            <span className="inline-block mt-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-zinc-400">Email</p>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-zinc-400">Vai trò</p>
            <p className="mt-1 text-sm">{user.role === "admin" ? "Quản trị viên" : "Khách hàng"}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-zinc-400">Ngày tạo</p>
            <p className="mt-1 text-sm">
              {new Date(user.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
