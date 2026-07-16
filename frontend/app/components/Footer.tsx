import React from "react";
import { MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer id="footer" className="bg-zinc-900 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-2xl font-bold text-white mb-3">
              Hotel<span className="text-amber-400">Hub</span>
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Trải nghiệm kỳ nghỉ sang trọng đích thực giữa lòng thành phố Hồ Chí Minh.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                <span>123 Nguyễn Huệ, Quận 1, TP. HCM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+842812345678" className="hover:text-amber-400 transition">
                  +84 28 1234 5678
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Theo dõi
            </h3>
            <p className="text-sm text-zinc-400">
              Cập nhật những ưu đãi mới nhất và câu chuyện từ HotelHub.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500">
          © 2026 HotelHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
