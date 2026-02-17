import { TrendingUp, Mail } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="space-y-8">
      <section className="border-2 border-black p-4 bg-white">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-black">
          <TrendingUp className="w-5 h-5" />
          <h3 className="uppercase tracking-wide">Đang được quan tâm</h3>
        </div>
        <ol className="space-y-3">
          {[
            "Sự tiến hóa của thiết kế web",
            "Văn hóa cà phê trên thế giới",
            "Ứng dụng năng suất nổi bật năm 2025",
            "Mẹo nhiếp ảnh cho người mới bắt đầu",
            "Sức khỏe tinh thần trong ngành công nghệ",
          ].map((topic, index) => (
            <li key={index} className="border-b border-neutral-300 pb-2 last:border-0">
              <a href="#" className="hover:underline flex gap-3">
                <span className="text-2xl">{index + 1}.</span>
                <span>{topic}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-2 border-black p-4 bg-black text-white">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5" />
          <h3 className="uppercase tracking-wide">Bản tin</h3>
        </div>
        <p className="mb-4 text-sm">Nhận các bài viết mới nhất trong hộp thư mỗi tuần.</p>
        <input
          type="email"
          placeholder="Địa chỉ email của bạn"
          className="w-full px-3 py-2 mb-3 text-black border border-white"
        />
        <button className="w-full bg-white text-black py-2 uppercase tracking-wide hover:bg-neutral-200 transition-colors">
          Đăng ký
        </button>
      </section>

      <section className="border-2 border-black p-4 bg-neutral-100">
        <h3 className="uppercase tracking-wide mb-3 pb-2 border-b-2 border-black">Về blog này</h3>
        <p className="text-sm leading-relaxed">
          The Daily Chronicle là hành trình cá nhân khám phá công nghệ, đời sống và văn hóa.
          Đây là nơi mình ghi lại góc nhìn và trải nghiệm trong thế giới hiện đại.
        </p>
      </section>

      <section className="border-2 border-black p-4 bg-white">
        <h3 className="uppercase tracking-wide mb-3 pb-2 border-b-2 border-black">Lưu trữ</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="hover:underline">
              Tháng 12/2025
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Tháng 11/2025
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Tháng 10/2025
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Tháng 09/2025
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Xem tất cả →
            </a>
          </li>
        </ul>
      </section>
    </aside>
  );
}
