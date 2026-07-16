import React from "react";
import { Waves, Sparkles, UtensilsCrossed, Headphones } from "lucide-react";

const services = [
  {
    icon: Waves,
    title: "Hồ bơi vô cực",
    desc: "Thư giãn tại hồ bơi vô cực nhìn ra toàn cảnh thành phố và biển xanh.",
  },
  {
    icon: Sparkles,
    title: "Spa & Wellness",
    desc: "Liệu trình spa cao cấp giúp bạn tái tạo năng lượng và tinh thần.",
  },
  {
    icon: UtensilsCrossed,
    title: "Ẩm thực tinh hoa",
    desc: "Trải nghiệm ẩm thực Á — Âu được chế biến bởi các đầu bếp hàng đầu.",
  },
  {
    icon: Headphones,
    title: "Butler 24/7",
    desc: "Đội ngũ butler chuyên nghiệp phục vụ bạn 24/7 cho mọi yêu cầu.",
  },
];

export function LandingServices() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-amber-700 text-sm font-semibold tracking-widest uppercase mb-2">
            Dịch vụ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            Trải nghiệm đẳng cấp 5 sao
          </h2>
          <p className="text-zinc-600 max-w-xl mx-auto">
            Mọi dịch vụ tại HotelHub đều được thiết kế để mang đến cho bạn sự hài lòng tuyệt đối.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border border-zinc-100 hover:border-amber-200 hover:bg-amber-50/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
