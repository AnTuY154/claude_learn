import {domain12Editorial,type EditorialLesson} from "@/lib/editorial-domain12";
import {sourceLearningObjectives} from "@/lib/source-learning-objectives";
import {domain3Editorial} from "@/lib/editorial-domain3";
import {domain4Editorial} from "@/lib/editorial-domain4";

const reviewed = new Map<string,EditorialLesson>(
 [...domain12Editorial,...domain3Editorial,...domain4Editorial].map(entry=>[entry.id,entry])
);

/**
 * A source-scoped conceptual lecture appears before every existing full lesson.
 * This is independent teaching prose, not scraped or reproduced source material.
 * All assertions are traceable to each lesson's curriculum page.
 * Examples are illustrative; they do not assert measured model performance.
 */
export default function SourceVerifiedLecture({id,language}:{id:string;language:"vi"|"en"}){
 const entry=reviewed.get(id);
 if(!entry) return null;
 const vi=language==="vi",i=vi?0:1;
 const objectives=sourceLearningObjectives[id]??[];
 const parts=[
  {title:vi?"Bản chất và cơ chế":"Definition and mechanism",body:entry.mechanism[i]},
  {title:vi?"Tình huống ứng dụng (minh hoạ)":"Worked scenario (illustrative)",body:entry.example[i]},
  {title:vi?"Phân biệt các cách làm và giới hạn":"Distinctions and boundaries",body:entry.distinction[i]},
  {title:vi?"Bẫy đề thi và lựa chọn cần tránh":"Exam traps and incorrect choices",body:entry.examTrap[i]}
 ];
 return <section className="source-lecture bilingual-topics" aria-label={vi?"Bài giảng đối chiếu theo nguồn duy nhất":"Single-source aligned lecture"}>
  <div className="section-heading">
   <span>{vi?"ĐỐI CHIẾU NGUỒN · BẢN GIẢNG BIÊN SOẠN LẠI":"SOURCE-ALIGNED · REVISED LECTURE"}</span>
   <h2>{vi?"Hiểu bản chất trước khi luyện tập":"Understand the decisions before the quiz"}</h2>
  </div>
  <p>{vi
   ?"Phần này được diễn giải lại theo đúng Task Statement của bài tại Claude Certification Guide. Ví dụ là tình huống minh hoạ, không phải số liệu kiểm chứng. Những khác biệt 'Exam Guide' và 'Current state' chỉ được trình bày khi trang nguồn nêu rõ."
   :"This independent explanation follows the matching Task Statement on Claude Certification Guide. Scenarios are illustrative, not measured results. Exam Guide versus Current state differences are included only where that curriculum page explicitly distinguishes them."}</p>
  <section className="lesson-summary bilingual-summary">
   <strong>{vi?"5 MỤC TIÊU KIẾN THỨC CẦN NẮM":"FIVE LESSON OBJECTIVES"}</strong>
   <ol>{objectives.map((objective,index)=><li key={index}>{objective[i]}</li>)}</ol>
  </section>
  {parts.map((part,index)=><section className="course-topic domain2-topic" key={part.title}>
   <div className="course-topic-heading"><span>{String(index+1).padStart(2,"0")}</span><div><small>{id} · {vi?"KIẾN THỨC TRỌNG TÂM":"CORE CONCEPT"}</small><h3>{part.title}</h3></div></div>
   <p>{part.body}</p>
  </section>)}
  <p className="bilingual-source">{vi?"Nguồn duy nhất dùng để kiểm chứng phần này":"Sole source used to check this section"}: <a href={entry.source} target="_blank" rel="noreferrer">{entry.source} ↗</a></p>
 </section>;
}
