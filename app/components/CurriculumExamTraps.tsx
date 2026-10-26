import {domain12Editorial} from "@/lib/editorial-domain12";
import {domain3Editorial} from "@/lib/editorial-domain3";
import {domain4Editorial} from "@/lib/editorial-domain4";
import {domain5Editorial} from "@/lib/editorial-domain5";

const traps = new Map(
 [...domain12Editorial,...domain3Editorial,...domain4Editorial,...domain5Editorial]
 .map(item=>[item.id,item.examTrap] as const)
);
const special35={
 vi:[
  "Nếu mô tả bằng lời khiến kết quả không nhất quán, đừng chỉ viết lại mô tả dài hơn: hãy cung cấp 2–3 ví dụ trước/sau.",
  "Các thay đổi liên quan cùng một contract cần gửi trong một lượt feedback; các lỗi độc lập nên xử lý tuần tự.",
  "Khi đã biết rõ phép biến đổi, dùng ví dụ cụ thể thay vì phỏng vấn; phỏng vấn chỉ phù hợp để làm rõ lĩnh vực chưa hiểu."
 ],
 en:[
  "If prose creates inconsistent transformations, provide two or three exact before/after pairs instead of rewriting the description.",
  "Corrections that affect the same contract belong in one feedback message; independent issues can be handled sequentially.",
  "Use examples for a known transformation and interviews for an unfamiliar domain where requirements have not been discovered."
 ]
};
export default function CurriculumExamTraps({id,language}:{id:string;language:"vi"|"en"}){
 const vi=language==="vi",exam35=id==="3.5",pair=traps.get(id);
 if(!pair&&!exam35)return null;
 return <section className="curriculum-exam-traps" aria-label="Exam Traps">
  <div className="section-heading"><span>{vi?"BẪY THI":"EXAM TRAPS"}</span><h2>Exam Traps</h2></div>
  {exam35?<ul>{special35[language].map(t=><li key={t}>{t}</li>)}</ul>:<p>{pair?.[vi?0:1]}</p>}
 </section>;
}
