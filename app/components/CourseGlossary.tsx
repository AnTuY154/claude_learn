"use client";

import { useMemo, useState, type ReactNode } from "react";
import { glossaryMap, lessonGlossary, type Term } from "@/lib/course-glossary";

// Khớp cụm dài trước ("structured findings" trước "findings") để không cắt sai.
// Chỉ chú thích văn bản LÝ THUYẾT, không thay tên định danh bên trong code.
function escapeRegex(s:string){return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");}
function matcher(terms:Term[]) {
  const names=terms.map(t=>t.term).sort((a,b)=>b.length-a.length);
  // Không match từ ở giữa identifier: pretooluse_value, source_url,...
  return new RegExp("(?<![A-Za-z0-9_])("+names.map(escapeRegex).join("|")+")(?![A-Za-z0-9_])","gi");
}

export function TermText({text,number,active}:{text:string;number:number;active:boolean}):ReactNode {
  const terms=useMemo(()=> (lessonGlossary[number]??[])
    .map(name=>glossaryMap.get(name.toLowerCase())).filter((x):x is Term=>!!x),[number]);
  const re=useMemo(()=>terms.length?matcher(terms):null,[terms]);
  if(!active || !re) return text;
  const parts:ReactNode[]=[];
  let start=0, match:RegExpExecArray|null;
  let i=0;
  while((match=re.exec(text))!==null){
    if(match.index>start)parts.push(text.slice(start,match.index));
    const term=glossaryMap.get(match[0].toLowerCase());
    if(term)parts.push(<TermTrigger key={i++} term={term}/>);
    else parts.push(match[0]);
    start=match.index+match[0].length;
  }
  if(start<text.length)parts.push(text.slice(start));
  return <>{parts}</>;
}

function TermTrigger({term}:{term:Term}){
  const [open,setOpen]=useState(false);
  return <span className="course-term">
    <button type="button" aria-expanded={open} aria-label={`Giải nghĩa thuật ngữ ${term.term}`}
      title={`${term.vi}: ${term.explanation}`} onClick={()=>setOpen(!open)}
      className="course-term-button">{term.term}<sup>?</sup></button>
    {open&&<span className="course-term-popup" role="note">
      <strong>{term.vi}</strong><span>{term.explanation}</span>
      <button type="button" onClick={()=>setOpen(false)} aria-label="Đóng chú thích">×</button>
    </span>}
  </span>;
}

export function LessonGlossary({number}:{number:number}){
  const terms=(lessonGlossary[number]??[]).map(t=>glossaryMap.get(t.toLowerCase())).filter((x):x is Term=>!!x);
  return <details className="course-glossary" id="terminology">
    <summary><strong>Từ điển thuật ngữ Lesson 1.{number}</strong><span>{terms.length} thuật ngữ · Nhấn để xem ý nghĩa tiếng Việt</span></summary>
    <dl>{terms.map(term=><div key={term.term}>
      <dt>{term.term}<small>{term.vi}</small></dt><dd>{term.explanation}</dd>
    </div>)}</dl>
  </details>;
}
