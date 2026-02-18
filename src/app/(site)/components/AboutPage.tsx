export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="mb-4">Giới thiệu(About)</h1>
      </header>

      <div className="prose">
        <p>
          <strong>The Daily Chronicle</strong> là một blog cá nhân, nơi mình suy nghĩ về thiết kế,
          công nghệ và cách làm việc. Nơi mà thích chửi thề cũng chả có ai quan tâm.
        </p>
        <p>
          Trang này theo tinh thần viết cái quần què gì cũng được. Vì ngoài thằng chủ của cái web này thì còn lại cũng chả có ma nào vào.
          Cũng chính vì điều đó đây là nơi bay bổng nhất mà tôi - anh Hưng bay bổng tạo ra nó để giải stress

        </p>

        <h2>Cấu trúc</h2>

        <p>Nội dung được tổ chức thành ba mảng chính:</p>

        <p>
          <strong>EDITORIAL</strong> là nơi chứa những cách suy nghĩ, document về trước khi phát triển 1 cái trò con bò nào đó mà chủ blog nghĩ ra
        </p>

        <p>
          <strong>NOTES</strong> là các bài viết về những lưu ý, những thất bại trong quá trình phát triển. Phát triển gì thì không biết 
        </p>

        <p>
          <strong>DIARY</strong> là những ghi chép ngắn và riêng tư. Ví dụ à? Nhật kí phát triển phần mềm hoặc táo bạo hơn thì chúng ta có Nhật kí con bạc này
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
          Nếu bạn muốn trao đổi, góp ý hoặc chỉ đơn giản là chào nhau, hãy gửi email tới {" "}
          <a
            href="mailto:phamngochung3032001@gmail.com"
            className="underline hover:text-muted-foreground transition-colors"
          >
            phamngochung3032001@gmail.com
          </a>
          . Tôi cũng không check mail đâu nhưng mà được cái UI có cái chỗ này cho vui. Chứ design xong không biết ghi gì ở đây
        </p>

        <div className="mt-16 pt-8 border-t border-border text-center">
          <span className="text-2xl text-muted-foreground">◆</span>
        </div>
      </div>
    </div>
  );
}
