import React from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
      <Inbox className="w-10 h-10 mb-3" />
      <p className="text-sm">{message ?? "Không có dữ liệu"}</p>
    </div>
  );
}