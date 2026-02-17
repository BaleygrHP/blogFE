export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Giới thiệu</h1>
      </header>

      <div className="prose">
        <p>
          <strong>The Daily Chronicle</strong> là một tòa soạn cá nhân, nơi mình suy nghĩ về thiết kế,
          công nghệ và cách làm việc có chiều sâu.
        </p>

        <p>
          Trang này theo tinh thần giao diện tĩnh lặng: ưu tiên văn bản, giảm xao nhãng, và tôn trọng sự tập
          trung của người đọc. Thiết kế không cần phải vô hình, nhưng cũng không nên lấn át nội dung.
        </p>

        <h2>Cấu trúc</h2>

        <p>Nội dung được tổ chức thành ba mảng chính:</p>

        <p>
          <strong>EDITORIAL</strong> gồm các bài nêu quan điểm và bình luận. Đây là góc nhìn cá nhân, không phải
          chỉ dẫn bắt buộc.
        </p>

        <p>
          <strong>NOTES</strong> là các bài đào sâu công cụ, kỹ thuật và thực hành. Có cấu trúc hơn nhật ký,
          nhưng ít thiên về tranh luận hơn biên tập.
        </p>

        <p>
          <strong>DIARY</strong> là những ghi chép ngắn và riêng tư. Ý tưởng đang hình thành, quan sát vụn, và
          những suy nghĩ còn dang dở.
        </p>

        <h2>Nguyên tắc</h2>

        <p>Trang này được xây dựng dựa trên vài niềm tin cốt lõi:</p>

        <ul>
          <li>Văn bản là trung tâm. Hình ảnh chỉ nên hỗ trợ việc đọc.</li>
          <li>Thiết kế cần bình tĩnh, không phô trương.</li>
          <li>Tính năng phải có lý do tồn tại.</li>
          <li>Giới hạn đúng cách giúp tăng sáng tạo.</li>
        </ul>

        <h2>Liên hệ</h2>

        <p>
          Nếu bạn muốn trao đổi, góp ý hoặc chỉ đơn giản là chào nhau, hãy gửi email tới{" "}
          <a
            href="mailto:editor@dailychronicle.com"
            className="underline hover:text-muted-foreground transition-colors"
          >
            editor@dailychronicle.com
          </a>
          .
        </p>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <span className="text-2xl text-muted-foreground">◆</span>
        </div>
      </div>
    </div>
  );
}
