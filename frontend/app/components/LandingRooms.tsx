import React from "react";
import Image from "next/image";
import { Users } from "lucide-react";

interface Room {
  name: string;
  type: string;
  price: number;
  guests: number;
  image: string;
}

const rooms: Room[] = [
  {
    name: "Deluxe Ocean",
    type: "Phòng Deluxe hướng biển",
    price: 2500000,
    guests: 2,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Presidential Suite",
    type: "Phòng Tổng thống cao cấp",
    price: 8500000,
    guests: 4,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Executive Suite",
    type: "Phòng Suite dành cho doanh nhân",
    price: 4500000,
    guests: 3,
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  },
];

const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export function LandingRooms() {
  return (
    <section id="rooms" className="py-20 sm:py-28 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-amber-700 text-sm font-semibold tracking-widest uppercase mb-2">
            Phòng &amp; Suite
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            Không gian nghỉ dưỡng đẳng cấp
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Mỗi phòng được thiết kế tỉ mỉ với sự thoải mái và sang trọng làm trung tâm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <article
              key={room.name}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                  {room.type}
                </p>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{room.name}</h3>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Users className="w-4 h-4" />
                    <span>Tối đa {room.guests} khách</span>
                  </div>
                  <p className="text-base font-bold text-zinc-900">{formatVnd(room.price)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
