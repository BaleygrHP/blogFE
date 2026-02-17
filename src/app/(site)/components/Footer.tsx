import { Twitter, Linkedin, Github, Rss } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="uppercase tracking-wide mb-4">Chuyên mục</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white">
                  Công nghệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Đời sống
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Du lịch
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Góc nhìn
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-wide mb-4">Kết nối</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white">
                  Về tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Bản tin
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  RSS
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-wide mb-4">Pháp lý</h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white">
                  Chính sách riêng tư
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Chính sách cookie
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-wide mb-4">Theo dõi</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-neutral-300 transition-colors">
                <Rss className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 pt-8 text-center text-sm text-neutral-400">
          <p>© 2025 The Daily Chronicle. Bảo lưu mọi quyền.</p>
          <p className="mt-2 italic">&quot;Tất cả tin tức quan trọng với tôi&quot;</p>
        </div>
      </div>
    </footer>
  );
}
