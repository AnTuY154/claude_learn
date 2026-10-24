/**
 * Deterministic gates for the CCAR-F curriculum reviewer.
 * The ONLY authoritative material is https://claudecertificationguide.com/learn/*
 * Model findings are proposals, not verified corrections or exam answers.
 */
export const TRUSTED_ORIGIN = "https://claudecertificationguide.com";
export const TRUSTED_PATH = "/learn/";

export function sourceUrlAllowed(input) {
  try {
    const url = new URL(input);
    return url.origin === TRUSTED_ORIGIN && url.pathname.startsWith(TRUSTED_PATH)
      && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}

export function normalise(value) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim().toLocaleLowerCase("en");
}
function decodeEntities(s) {
  const named={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",hellip:"…",mdash:"—",ndash:"–",rsquo:"’",lsquo:"‘",ldquo:"“",rdquo:"”"};
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(_,entity)=>{
    if(entity.startsWith("#")) {
      const n=entity[1].toLowerCase()==="x"?parseInt(entity.slice(2),16):parseInt(entity.slice(1),10);
      return Number.isInteger(n)&&n>=0&&n<=0x10ffff?String.fromCodePoint(n):" ";
    }
    return named[entity.toLowerCase()]??" ";
  });
}
export function readableSource(html) {
  if(typeof html!=="string"||!html.includes("<"))throw new Error("Source is not an HTML document");
  let text=html.replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi," ");
  text=text.replace(/<!--[\s\S]*?-->/g," ").replace(/<\/(?:p|h[1-6]|li|ul|ol|pre|section|div|article|main|br)>/gi,"\n");
  text=decodeEntities(text.replace(/<[^>]+>/g," "));
  const start=text.indexOf("What You Need to Know");
  if(start<0||!text.includes("Exam Traps")||!text.includes("Build Exercise"))throw new Error("Source lesson missing critical headings; cannot verify content");
  text=text.slice(start).replace(/[ \t]+/g," ").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
  if(text.length<1800||text.length>175000)throw new Error("Unexpected source length; refusing to truncate or claim verification");
  return text;
}
function flattenStrings(value,result=[]) {
  if(typeof value==="string"){result.push(value);return result;}
  if(Array.isArray(value)){for(const v of value)flattenStrings(v,result);return result;}
  if(value&&typeof value==="object"){for(const v of Object.values(value))flattenStrings(v,result);}
  return result;
}
export function snapshotText(lesson){return flattenStrings(lesson).join("\n");}
const validIds=new Set([
  ...Array.from({length:7},(_,i)=>"1."+(i+1)),
  ...Array.from({length:5},(_,i)=>"2."+(i+1)),
  ...Array.from({length:6},(_,i)=>"3."+(i+1)),
  ...Array.from({length:6},(_,i)=>"4."+(i+1))
]);
export function parseLessonSelection(raw) {
  if(raw==="all")return [...validIds];
  if(!validIds.has(raw))throw new Error("Choose --lesson all or one of the 24 CCAR-F lesson IDs (e.g. 2.4).");
  return [raw];
}
export function inspectLesson(row) {
  const findings=[];
  const flag=(criterion,details)=>findings.push({criterion,details});
  if(!sourceUrlAllowed(row.source))flag("source_scope","Source URL is not within the sole trusted /learn origin.");
  if(!row.source.includes("/"+row.id.replace(".","-")+"-"))flag("source_mismatch","Source path does not identify the matching task.");
  if(!Array.isArray(row.objectives)||row.objectives.length!==5)flag("concept_coverage","Five source-scoped objective markers are required.");
  if(!row.editorial||row.editorial.source!==row.source)flag("editorial_source","Editorial source and lesson source differ.");
  for(const lang of ["vi","en"]){
    const body=row[lang];
    if(!body){flag("bilingual","Missing "+lang+" lesson");continue;}
    const sections=body.sections??body.topics;
    if(!Array.isArray(sections)||sections.length<5)flag("coverage","Too few teaching sections in "+lang);
    const quiz=body.quiz;
    if(!Array.isArray(quiz)||quiz.length<8){flag("quiz_count","Missing eight quiz checks for "+lang);continue;}
    for(const [i,q] of quiz.entries()){
      const options=q.choices;
      if(!Array.isArray(options)||options.length!==4){flag("quiz_four_options",lang+" Q"+(i+1));continue;}
      if(new Set(options.map(normalise)).size!==4)flag("quiz_duplicate_options",lang+" Q"+(i+1));
      if(!Number.isInteger(q.correct)||q.correct<0||q.correct>3)flag("quiz_answer",lang+" Q"+(i+1));
      if(!q.explanation||String(q.explanation).trim().length<25)flag("quiz_explanation",lang+" Q"+(i+1));
    }
    const steps=body.lab?.steps??body.steps;
    if(!Array.isArray(steps)||steps.length<3)flag("build_exercise","Incomplete exercises in "+lang);
  }
  if(row.vi?.quiz?.length===row.en?.quiz?.length)row.vi.quiz.forEach((q,i)=>{
    if(row.en.quiz[i]?.correct!==q.correct)flag("answer_parity","Mismatch VI/EN answer key at Q"+(i+1));
  });
  return findings;
}
const criteria = new Set(["fidelity","coverage","bilingual","exam_guide_distinction","quiz","build_exercise","clarity"]);
const severities=new Set(["blocker","high","medium","low"]);
export function checkModelAssessment(candidate,sourceText,localSnapshot) {
  if(!candidate||typeof candidate!=="object"||!Array.isArray(candidate.findings)||!candidate.summary)
    throw new Error("Invalid model JSON assessment");
  if(candidate.findings.length>24)throw new Error("Overlarge model finding set, ask for fewer actionable issues");
  const accepted=[],rejected=[];
  for(const item of candidate.findings){
    if(!item||!criteria.has(item.criterion)||!severities.has(item.severity)||!item.issue||!item.suggested_fix){
      rejected.push({reason:"invalid finding shape",finding:item});continue;
    }
    if(typeof item.source_quote!=="string"||item.source_quote.trim().length<12||
       !normalise(sourceText).includes(normalise(item.source_quote))){
      rejected.push({reason:"source quote not found verbatim in trusted source",finding:item});continue;
    }
    if(item.website_quote&&
      (typeof item.website_quote!=="string"||!normalise(localSnapshot).includes(normalise(item.website_quote)))){
      rejected.push({reason:"website quote not found in supplied website snapshot",finding:item});continue;
    }
    accepted.push({
      criterion:item.criterion,severity:item.severity,location:String(item.location||"unknown"),
      issue:String(item.issue),source_quote:item.source_quote,
      website_quote:item.website_quote||"",suggested_fix:String(item.suggested_fix),
      evidence_status:item.website_quote?"both_quotes_present_not_semantically_adjudicated":"source_only_requires_manual_check"
    });
  }
  return {summary:String(candidate.summary),accepted,rejected};
}
export function markdownReport(results) {
  const line=["# CCAR-F Curriculum Review Agent","",
    "Single trusted source: https://claudecertificationguide.com/learn/",
    "Model judgements are **review candidates**, not verified claims or corrections.",
    "A matched quotation confirms text presence only; it does not establish whether the model's interpretation is correct.",
    ""];
  for(const r of results){
    line.push("## Lesson "+r.id, "",
      "- Source: "+r.source,
      "- Source fetched: "+r.source_status,
      "- AI comparison: "+r.review_status,
      "- Structural issues: "+r.structural_findings.length,
      "- Evidence-linked model candidates: "+(r.model?.accepted.length??0),
      "- Model candidates rejected by evidence checks: "+(r.model?.rejected.length??0), "");
    if(r.error)line.push("**BLOCKED**: "+r.error,"");
    for(const f of r.structural_findings)line.push("- [STRUCTURE] "+f.criterion+": "+f.details);
    for(const f of r.model?.accepted||[]){
      line.push("### "+f.severity.toUpperCase()+" — "+f.criterion,"",
        "- Section: "+f.location,
        "- Concern: "+f.issue,
        "- Source excerpt: "+f.source_quote,
        "- Website excerpt: "+(f.website_quote||"[missing/omission candidate]"),
        "- Evidence status: "+f.evidence_status,
        "- Proposed change: "+f.suggested_fix,"");
    }
    if(r.model?.accepted?.length===0&&r.review_status==="completed")line.push("No evidence-linked concerns reported; this is not proof of complete correctness.","");
  }
  return line.join("\n")+"\n";
}
