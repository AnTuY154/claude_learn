import type {ReactNode} from "react";

export default function LessonStageNav({language,exerciseId,quizId,sourceUrl}:{
 language:"vi"|"en";exerciseId:string;quizId:string;sourceUrl:string;
}):ReactNode{
 const vi=language==="vi";
 const stages=[
  {number:"01",href:"#lecture",name:vi?"Bài giảng":"Lecture",detail:vi?"Cơ chế · ví dụ · bẫy thi":"Mechanisms · examples · traps"},
  {number:"02",href:"#"+exerciseId,name:vi?"Bài tập":"Practical exercise",detail:vi?"Các bước · chạy kiểm chứng":"Steps · check your work"},
  {number:"03",href:"#"+quizId,name:vi?"Câu hỏi":"Multiple-choice questions",detail:vi?"Tự kiểm tra sau khi thực hành":"Test yourself after practice"}
 ];
 return <nav className="lesson-three-stage" aria-label={vi?"Ba bước học của bài":"Three stages of this lesson"}>
  <p className="lesson-three-stage-intro">{vi?"Học theo đúng trình tự: đọc bài giảng trước, thực hành, rồi mới trả lời câu hỏi.":"Follow the three-stage order: study the lecture, complete the exercise, then answer the questions."}</p>
  <ol>{stages.map(stage=><li key={stage.number}>
    <a href={stage.href}><span>{stage.number}</span><strong>{stage.name}</strong><small>{stage.detail}</small></a>
  </li>)}</ol>
  <p className="lesson-source-note">{vi
   ?"Nội dung là bản giải thích biên soạn lại theo giáo trình, không phải bản dịch nguyên văn. Đối chiếu các chi tiết và ví dụ trên trang nguồn:"
   :"This is an independently written explanation of the curriculum, not a verbatim copy. Consult the original page for exact examples and wording:"}{" "}
   <a href={sourceUrl} target="_blank" rel="noreferrer">{vi?"Bài gốc":"Original lesson"} ↗</a>
  </p>
  {vi&&<p className="lesson-source-note">Muốn đọc <strong>toàn bộ nội dung gốc bằng tiếng Việt</strong>, hãy mở bài gốc và dùng chức năng <strong>Dịch sang tiếng Việt</strong> của trình duyệt. Bản giải thích trên website này giúp học và luyện tập nhưng không thay thế nguyên văn tài liệu nguồn.</p>}
 </nav>;
}
