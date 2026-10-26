import {sourceDetailAdditions} from "@/lib/source-detail-additions";

export default function SourceDetailChapters({id,language}:{id:string;language:"vi"|"en"}){
 const entries=sourceDetailAdditions[id];
 if(!entries?.length)return null;
 const vi=language==="vi",i=vi?0:1;
 return <section className="bilingual-topics source-detail-chapters" aria-label={vi?"Giải thích bổ sung các mục trong nguồn":"Additional source-scoped explanations"}>
  <div className="section-heading"><span>{vi?"BÀI GIẢNG · GIẢI THÍCH CHI TIẾT":"LECTURE · DEEPER CONCEPTS"}</span>
   <h2>{vi?"Những phần cần hiểu thêm":"Further distinctions from the source curriculum"}</h2></div>
  {entries.map((entry,index)=><section className="course-topic domain2-topic" key={entry.title[1]}>
    <div className="course-topic-heading"><span>{String(index+1).padStart(2,"0")}</span><div><small>{id} · {entry.scope==="supplement"?(vi?"MỞ RỘNG, KHÔNG PHẢI TRỌNG TÂM BÀI THI":"BEYOND THE EXAM GUIDE"):(vi?"TRỌNG TÂM TASK STATEMENT":"TASK STATEMENT CONCEPT")}</small><h3>{entry.title[i]}</h3></div></div>
    <p>{entry.detail[i]}</p>
    <p><strong>{vi?"Ví dụ ứng dụng:":"Worked example:"}</strong> {entry.example[i]}</p>
    <div className="foundation-exam-key"><strong>{vi?"BẪY CẦN TRÁNH":"EXAM TRAP"}</strong><p>{entry.trap[i]}</p></div>
  </section>)}
 </section>;
}
