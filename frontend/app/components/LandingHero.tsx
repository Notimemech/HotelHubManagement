"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function LandingHero() {
  const router = useRouter();
  const { user } = useAuth();

  const handleCta = () => {
    if (user) router.push("/rooms");
    else router.push("/login");
  };

  return (
    <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-zinc-900">
      <Image
        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
        alt="Luxury hotel view"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-amber-400 text-sm sm:text-base font-semibold tracking-[0.2em] uppercase mb-4">
          HotelHub · Vietnam
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Trải Nghiệm Kỳ Nghỉ Sang Trọng <br className="hidden sm:block" /> Tại HotelHub
        </h1>
        <p className="text-zinc-200 text-base sm:text-lg max-w-2xl mx-auto mb-10">
          Nơi sự thanh lịch gặp gỡ sự thoải mái. Đặt phòng ngay hôm nay và tận hưởng những khoảnh khắc đáng nhớ bên gia đình và bạn bè.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCta}
            className="px-8 py-3.5 text-base font-semibold text-zinc-900 bg-amber-400 hover:bg-amber-300 rounded-md transition shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            Đặt phòng ngay
          </button>
          <a
            href="#rooms"
            className="px-8 py-3.5 text-base font-semibold text-white border border-white/30 hover:bg-white/10 rounded-md transition backdrop-blur-sm"
          >
            Khám phá phòng
          </a>
        </div>
      </div>
    </section>
  );
}
