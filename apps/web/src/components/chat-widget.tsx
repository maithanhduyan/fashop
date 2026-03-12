"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "Xin chào! 👋 Fashop có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    // Simple auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: getBotReply(text),
        },
      ]);
    }, 800);
  }

  return (
    <>
      {/* Chat bubble button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở chat hỗ trợ"
          className="chat-pulse animate-bounce-in fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="animate-slide-in-right fixed bottom-6 right-6 z-50 flex h-[420px] w-[340px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-sm font-semibold">Fashop Support</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex border-t border-zinc-200 dark:border-zinc-700"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              className="px-4 text-blue-600 transition hover:text-blue-700 dark:text-blue-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function getBotReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("giao hàng") || lower.includes("ship") || lower.includes("vận chuyển")) {
    return "Fashop giao hàng toàn quốc trong 2-5 ngày. Miễn phí ship cho đơn từ 500.000đ! 🚚";
  }
  if (lower.includes("đổi") || lower.includes("trả") || lower.includes("hoàn")) {
    return "Bạn được đổi/trả miễn phí trong 30 ngày nếu sản phẩm còn nguyên tem mác. 🔄";
  }
  if (lower.includes("size") || lower.includes("kích")) {
    return "Bạn có thể tham khảo bảng size trên trang sản phẩm. Nếu phân vân, hãy chọn size lớn hơn nhé! 📏";
  }
  if (lower.includes("thanh toán") || lower.includes("payment") || lower.includes("trả tiền")) {
    return "Fashop hỗ trợ COD, chuyển khoản ngân hàng, và các ví điện tử phổ biến. 💳";
  }
  if (lower.includes("giảm giá") || lower.includes("khuyến mãi") || lower.includes("sale")) {
    return "Hiện tại Fashop đang có chương trình giảm giá lên đến 50%! Xem ngay tại mục Sản phẩm nhé. 🔥";
  }
  return "Cảm ơn bạn đã nhắn tin! Nhân viên tư vấn sẽ phản hồi sớm nhất. Bạn cũng có thể gọi hotline 1900-6868 để được hỗ trợ nhanh hơn. 📞";
}
