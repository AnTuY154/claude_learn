"use client";

import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import content from "@/lib/practice390/questions-en.json";
import {restoreProgress, resultStatus, selectionIsValid, summary} from "@/lib/practice390/core";
import type {Answers, Choice, Progress, QuestionData} from "@/lib/practice390/core";

const data = content as unknown as QuestionData;
const questions = data.questions;
const STORAGE_KEY = "ccarf-codingnconcepts-390-source-bank-v1";
type Language = Progress["language"];
const copy = {
  vi: {
    back: "Về trang chủ", kicker: "CCAR-F · BỘ 390 CÂU TỪ NGUỒN GỐC", title: "Luyện tập 390 câu CCAR-F",
    intro: "Bộ 390 câu từ HTML bạn cung cấp, giữ nguyên nội dung tiếng Anh và thứ tự Q1–Q390.",
    warning: "Đáp án là đề xuất chưa xác minh của AI, KHÔNG phải đáp án chính thức. Nội dung câu hỏi chỉ có tiếng Anh; nút ngôn ngữ chỉ đổi giao diện.",
    source: "Xem trang nguồn Coding N Concepts", question: "Câu", selectOne: "Chọn MỘT đáp án", selectTwo: "Chọn HAI đáp án",
    selected: "Đã chọn", check: "Kiểm tra đáp án", answered: "Đã làm", correct: "Khớp AI", wrong: "Khác AI", ungraded: "Chưa chấm", left: "Còn lại", score: "Tỉ lệ khớp AI",
    matches: "Khớp đáp án AI đề xuất", differs: "Khác đáp án AI đề xuất", noKey: "Đáp án chưa xác định",
    yourAnswer: "Bạn chọn", proposed: "AI đề xuất", noExplanation: "Bộ JSON chưa có lời giải cho câu này.", noKeyDetails: "Câu Q123 có hai lựa chọn bị trùng trong HTML gốc. Câu trả lời được lưu nhưng không tính đúng/sai.",
    previous: "Câu trước", next: "Câu tiếp", nextUnanswered: "Câu chưa làm", restart: "Làm lại", resetConfirm: "Xoá toàn bộ kết quả của 390 câu và bắt đầu lại?",
    jump: "Chọn câu để luyện", search: "Tìm số câu hoặc từ khoá…", filterAll: "Tất cả domain", noMatches: "Không tìm thấy câu phù hợp.",
    done: "Đã hoàn thành bộ 390 câu", ready: "Chọn đáp án để nhận phản hồi dựa trên khoá đáp án AI dự kiến.",
    noticeReview: "Đáp án này được đánh dấu cần rà soát thêm trong dữ liệu.", uiLang: "Ngôn ngữ giao diện",
    gradedLabel: "Tỉ lệ chỉ tính các câu có đáp án AI dự kiến, không bao gồm câu chưa chấm."
  },
  en: {
    back: "Back to home", kicker: "CCAR-F · ORIGINAL 390-QUESTION BANK", title: "390 CCAR-F practice questions",
    intro: "All 390 questions from your supplied HTML, retaining their original English wording and Q1–Q390 ordering.",
    warning: "Answer keys are UNVERIFIED AI suggestions, not official answers. Question content is available in English only; the language toggle changes the interface.",
    source: "View original Coding N Concepts page", question: "Question", selectOne: "Select ONE", selectTwo: "Select TWO",
    selected: "Selected", check: "Check answers", answered: "Answered", correct: "Matches AI", wrong: "Differs from AI", ungraded: "Unscored", left: "Remaining", score: "AI-key match rate",
    matches: "Matches the suggested AI answer", differs: "Differs from the suggested AI answer", noKey: "Answer key unavailable",
    yourAnswer: "You chose", proposed: "AI suggests", noExplanation: "This JSON does not include an explanation for this question.", noKeyDetails: "The source HTML duplicates two choices for Q123. Your selection is saved but excluded from scoring.",
    previous: "Previous", next: "Next", nextUnanswered: "Next unanswered", restart: "Restart", resetConfirm: "Erase all responses to the 390-question bank?",
    jump: "Jump to question", search: "Search number or keywords…", filterAll: "All domains", noMatches: "No matching questions.",
    done: "All 390 questions completed", ready: "Choose an answer to see feedback against the unverified AI answer key.",
    noticeReview: "This answer has been flagged for additional review in the source data.", uiLang: "Interface language",
    gradedLabel: "The rate only includes questions with a proposed AI answer; unscored questions are excluded."
  }
} as const;

function storageRead(): Progress | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? restoreProgress(JSON.parse(json), questions) : null;
  } catch { return null; }
}

export default function Practice390() {
  const [language, setLanguage] = useState<Language>("vi");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [drafts, setDrafts] = useState<Answers>({});
  const [domain, setDomain] = useState(0);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = storageRead();
    if (saved) {
      setLanguage(saved.language);
      setCurrent(saved.current);
      setAnswers(saved.answers);
      setDrafts(saved.drafts);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({language, current, answers, drafts})); } catch { /* Local storage may be blocked. */ }
  }, [ready, language, current, answers, drafts]);

  const t = copy[language];
  const question = questions[current];
  const submitted = answers[question.id];
  const draft = drafts[question.id] ?? [];
  const revealed = submitted !== undefined;
  const status = resultStatus(question, submitted);
  const totals = useMemo(() => summary(questions, answers), [answers]);
  const filtered = useMemo(() => questions.filter(q => {
    if (domain !== 0 && q.domain !== domain) return false;
    const term = search.trim().toLowerCase();
    return !term || q.id.toLowerCase() === term.replace(/^#/, "") || String(q.number) === term || q.question.toLowerCase().includes(term);
  }), [domain, search]);

  const go = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrent(index);
    document.getElementById("p390-question")?.scrollIntoView({block: "start", behavior: "smooth"});
  };
  const submit = (selection: Choice[]) => {
    if (revealed || !selectionIsValid(selection, question, true)) return;
    setAnswers(old => ({...old, [question.id]: [...selection]}));
    setDrafts(old => { const next = {...old}; delete next[question.id]; return next; });
  };
  const choose = (key: Choice) => {
    if (revealed || !question.options.some(o => o.id === key)) return;
    if (question.selectCount === 1) { submit([key]); return; }
    setDrafts(old => {
      const previous = old[question.id] ?? [];
      const next = previous.includes(key) ? previous.filter(x => x !== key) : previous.length < question.selectCount ? [...previous, key] : previous;
      return {...old, [question.id]: next};
    });
  };
  const step = (offset: -1 | 1) => {
    const index = filtered.findIndex(q => q.id === question.id);
    const next = filtered[index + offset];
    if (next) go(next.number - 1);
  };
  const nextUnanswered = () => {
    const start = filtered.findIndex(q => q.id === question.id);
    for (let i = 1; i <= filtered.length; i++) {
      const item = filtered[(start + i + filtered.length) % filtered.length];
      if (item && answers[item.id] === undefined) { go(item.number - 1); return; }
    }
  };
  const changeDomain = (id: number) => {
    setDomain(id);
    setSearch("");
    const first = questions.find(q => id === 0 || q.domain === id);
    if (first) go(first.number - 1);
  };
  const restart = () => {
    if (!window.confirm(t.resetConfirm)) return;
    setAnswers({}); setDrafts({}); setCurrent(0); setDomain(0); setSearch("");
  };
  const currentInFilter = filtered.findIndex(q => q.id === question.id);
  const gradedLabel = `${totals.graded ? Math.round(100 * totals.correct / totals.graded) : 0}%`;

  return <main className="qb-page p390-page"><div className="qb-layout">
    <div className="qb-topline"><Link href="/">{t.back}</Link><span>CCAR-F /390</span></div>
    <header className="qb-hero"><div className="qb-hero-content">
      <p className="qb-kicker">{t.kicker}</p><h1>{t.title}</h1>
      <p className="qb-intro">{t.intro}</p>
      <p className="qb-disclaimer">{t.warning}</p>
      <p className="p390-source"><a href={data.source} target="_blank" rel="noopener noreferrer">{t.source} ↗</a></p>
    </div><div className="qb-lang" role="group" aria-label={t.uiLang}>
      <button type="button" aria-pressed={language === "vi"} className={language === "vi" ? "on" : ""} onClick={() => setLanguage("vi")}>Tiếng Việt</button>
      <button type="button" aria-pressed={language === "en"} className={language === "en" ? "on" : ""} onClick={() => setLanguage("en")}>English</button>
    </div></header>

    <section className="p390-domain-tabs" aria-label="Domain">
      <button type="button" aria-pressed={domain === 0} className={domain === 0 ? "active" : ""} onClick={() => changeDomain(0)}>{t.filterAll} <b>390</b></button>
      {data.domains.map(item => {
        const completed = questions.filter(q => q.domain === item.id && answers[q.id] !== undefined).length;
        return <button type="button" key={item.id} className={domain === item.id ? "active" : ""} aria-pressed={domain === item.id} onClick={() => changeDomain(item.id)} title={item.name}>
          Domain {item.id}<b>{completed}/{item.count}</b>
        </button>;
      })}
    </section>

    <section className="qb-statline p390-stats" aria-label={t.score}>
      <div><span>{t.answered}</span><strong>{totals.answered}<small> / 390</small></strong></div>
      <div><span>{t.correct}</span><strong>{totals.correct}</strong></div>
      <div><span>{t.wrong}</span><strong>{totals.incorrect}</strong></div>
      <div><span>{t.ungraded}</span><strong>{totals.ungraded}</strong></div>
      <div><span>{t.score}</span><strong>{gradedLabel}</strong></div>
    </section>
    <p className="p390-score-note">{t.gradedLabel} {t.left}: {totals.remaining}.</p>

    <div className="qb-main">
      <section className="qb-exam" id="p390-question">
        <div className="qb-question-head"><span>{question.id} / 390</span><span className="qb-domain">Domain {question.domain} · {question.domainName}</span></div>
        <h2>{question.question}</h2>
        <p className="qb-select-instruction">{question.selectCount === 2 ? t.selectTwo : t.selectOne}</p>
        <div className="qb-choices" role="group" aria-label={`${t.question} ${question.number}`}>
          {question.options.map(option => {
            const isSelected = (revealed ? submitted : draft).includes(option.id);
            const expected = revealed && question.correctAnswers?.includes(option.id);
            const state = !revealed ? (isSelected ? "draft" : "") : status === "ungraded" ? (isSelected ? "draft" : "") : expected ? "correct" : isSelected ? "incorrect" : "muted";
            return <button type="button" key={option.id} className={`qb-choice ${state}`} disabled={revealed} aria-pressed={isSelected} onClick={() => choose(option.id)}>
              <span className="qb-choice-key">{option.id}</span><span className="qb-choice-copy">{option.text}</span>
              {revealed && status !== "ungraded" && expected && <span className="qb-choice-result" aria-hidden="true">✓</span>}
              {revealed && status !== "ungraded" && isSelected && !expected && <span className="qb-choice-result" aria-hidden="true">×</span>}
              {!revealed && isSelected && <span className="qb-choice-result" aria-hidden="true">✓</span>}
            </button>;
          })}
        </div>
        {!revealed && question.selectCount === 2 && <div className="qb-selection-control" aria-live="polite">
          <p>{t.selected}: <strong>{draft.length}/{question.selectCount}</strong></p>
          <button type="button" disabled={draft.length !== question.selectCount} onClick={() => submit(draft)}>{t.check}</button>
        </div>}
        {revealed ? <section className={`qb-feedback ${status === "correct" ? "good" : status === "incorrect" ? "bad" : "p390-ungraded"}`} aria-live="polite">
          <h3>{status === "correct" ? `✓ ${t.matches}` : status === "incorrect" ? `× ${t.differs}` : `— ${t.noKey}`}</h3>
          <p><strong>{t.yourAnswer}:</strong> {submitted.join(", ")}</p>
          {question.correctAnswers ? <p><strong>{t.proposed}:</strong> {question.correctAnswers.join(", ")}</p> : <p>{t.noKeyDetails}</p>}
          {question.requiresReview && <p className="p390-review">{t.noticeReview}</p>}
          {question.explanation ? <p>{question.explanation}</p> : <p className="p390-no-explanation">{t.noExplanation}</p>}
        </section> : <p className="qb-prompt">{t.ready}</p>}
        {totals.answered === questions.length && <div className="qb-complete" role="status"><strong>{t.done} · {totals.correct}/{totals.graded} ({gradedLabel})</strong></div>}
        <div className="qb-controls">
          <button type="button" disabled={currentInFilter <= 0} onClick={() => step(-1)}>{t.previous}</button>
          <button type="button" disabled={filtered.length === 0 || filtered.every(q => answers[q.id] !== undefined)} onClick={nextUnanswered}>{t.nextUnanswered}</button>
          <button type="button" disabled={currentInFilter < 0 || currentInFilter >= filtered.length - 1} onClick={() => step(1)}>{t.next}</button>
        </div>
      </section>
      <aside className="qb-aside" aria-label={t.jump}>
        <div className="qb-aside-head"><h2>{t.jump}</h2><p>{t.answered}: {totals.answered}/390</p></div>
        <label className="p390-search"><span className="p390-sr-only">{t.search}</span><input value={search} type="search" placeholder={t.search} onChange={event => setSearch(event.target.value)}/></label>
        <div className="p390-jump-scroll"><div className="qb-grid">
          {filtered.map(q => {
            const state = resultStatus(q, answers[q.id]);
            const marker = state === "unanswered" && drafts[q.id]?.length ? "draft" : state;
            return <button type="button" key={q.id} className={`qb-jump ${marker}${q.id === question.id ? " current" : ""}`}
              aria-label={`${t.question} ${q.number}: ${marker}`} aria-current={q.id === question.id ? "step" : undefined} onClick={() => go(q.number - 1)}>{q.number}</button>;
          })}
        </div>{filtered.length === 0 && <p className="p390-empty">{t.noMatches}</p>}</div>
        <div className="qb-legend"><span><i className="right"/> {t.correct}</span><span><i className="wrong"/> {t.wrong}</span><span><i className="p390-neutral"/> {t.ungraded}</span><span><i className="pending"/> {t.left}</span></div>
        <button type="button" className="qb-reset" onClick={restart}>{t.restart}</button>
      </aside>
    </div>
  </div></main>;
}