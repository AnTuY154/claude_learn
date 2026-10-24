# CCAR-F Single-Source Review Agent

## Nguồn tin cậy duy nhất
Một agent kiểm tra 24 bài Domain 1–4. Nguồn nội dung DUY NHẤT là https://claudecertificationguide.com/learn và các trang Task Statement thuộc cùng /learn/.
Không dùng các trang Anthropic, mạng xã hội, blog, nguồn ngoài hoặc kiến thức thuộc bộ nhớ model để kết luận đúng/sai.
Agent chỉ đọc source và bản snapshot website, không tự sửa code, không đăng PR hoặc merge.

## Tiêu chí review
1. Bao phủ các Key Concepts và 5 objectives đúng trong Task Statement, không kéo kiến thức ngoài bài.
2. Tìm cơ chế sai, thiếu, mâu thuẫn, khẳng định quá chắc chắn hoặc suy luận không có nguồn.
3. Phân biệt Exam Guide và Current state CHỈ khi chính trang giáo trình phân biệt.
4. Đối chiếu đầy đủ nội dung VI/EN và thuật ngữ, không dịch thiếu ý.
5. Đánh giá 8 MCQ/bài: bốn lựa chọn A–D, key chính xác, distractors hợp lý, giải thích có lý do.
6. Ví dụ code, chú giải và Build Exercise phải gắn mục tiêu bài, không trình bày giả lập như kết quả API thực.
7. Mỗi finding AI phải có trích dẫn nguồn chính xác và nêu vị trí sửa. Quotes được kiểm bằng code.

## Chạy agent thật — GitHub Actions
1. Trong repository, mở Settings → Secrets and variables → Actions.
2. Thêm Secret ANTHROPIC_API_KEY; thêm Variable ANTHROPIC_MODEL (tên model mà account sử dụng được).
3. Mở Actions → CCAR-F Source-Only Curriculum Review → Run workflow.
4. Nhập all để soát 24 bài hoặc nhập mã riêng như 3.3 để chạy 1 bài.
5. Tải artifact ccarf-source-only-review để đọc report.md và report.json.

Chạy all sẽ gửi tối đa 24 model requests, có thể tốn API tokens; chỉ chạy thủ công, KHÔNG chạy khi push/PR.
Workflow chỉ có contents: read, không ghi website hay in API key ra báo cáo.

## Chạy local
Không cần key/network (chỉ kiểm tra cấu trúc; KHÔNG phải kiểm chứng nội dung):

    npm run review:ccarf -- --lesson all --check-only

Chế độ live yêu cầu hai biến môi trường ANTHROPIC_API_KEY và ANTHROPIC_MODEL:

    npm run review:ccarf -- --lesson 2.4
    npm run review:ccarf -- --lesson all

## Cơ chế chống bịa
- URL source và mọi redirect bị giới hạn đúng HTTPS host và path /learn/.
- HTML phải có What You Need to Know, Exam Traps, Build Exercise và kích thước nội dung đủ lớn; thiếu thì BLOCKED.
- SHA-256 của nội dung nguồn và snapshot website được ghi vào JSON để đối chiếu.
- Không cắt ngầm dữ liệu lớn; nếu quá ngưỡng sẽ báo BLOCKED.
- Các finding phải có source_quote tồn tại trong nguồn, website_quote nếu khẳng định có câu sai trên website.
- Trích dẫn khớp chữ KHÔNG đồng nghĩa với diễn giải chắc chắn đúng. Mọi kết luận AI cần kiểm tra thủ công.
- Nguồn không vào được / model trả JSON sai: không thể chấm đạt hoặc tự tuyên bố đúng.
- Report nằm ở artifacts/ccarf-source-review/report.md và report.json; mỗi bài có source_status, review_status và blocker.

Workflow cũ review-course.yml không đọc nguồn giáo trình, nên KHÔNG dùng để xác nhận content fidelity.
