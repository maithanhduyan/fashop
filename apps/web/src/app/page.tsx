import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Thời trang <span className="text-blue-600">Fashop</span>
      </h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Mua sắm thời trang nam nữ chất lượng cao, giá tốt nhất thị trường.
      </p>
      <Link
        href="/products"
        className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Xem sản phẩm →
      </Link>
    </div>
  );
}
