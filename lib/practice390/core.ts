export type Choice = "A" | "B" | "C" | "D";
export type Answers = Record<string, Choice[]>;
export type SourceQuestion = {
  id: string;
  number: number;
  domain: number;
  domainName: string;
  question: string;
  type: "single-select" | "multiple-select";
  selectCount: 1 | 2;
  options: {id: Choice; text: string}[];
  correctAnswers: Choice[] | null;
  explanation: string | null;
  answerStatus: string;
  answerNote?: string | null;
  requiresReview?: boolean;
};
export type QuestionData = {
  title: string;
  source: string;
  sourceType: string;
  domains: {id: number; name: string; count: number}[];
  totalQuestions: number;
  answerProvenance: string;
  answersVerified?: boolean;
  questions: SourceQuestion[];
};
export type Progress = {
  current: number;
  language: "vi" | "en";
  answers: Answers;
  drafts: Answers;
};

export function sameAnswerSet(actual: readonly Choice[] | undefined, expected: readonly Choice[] | null): boolean {
  return Boolean(actual && expected && actual.length === expected.length && new Set(actual).size === actual.length && expected.every(k => actual.includes(k)));
}

export function selectionIsValid(raw: unknown, question: SourceQuestion, completed: boolean): raw is Choice[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > question.selectCount) return false;
  if (completed && raw.length !== question.selectCount) return false;
  if (!completed && question.selectCount === 1) return false;
  if (new Set(raw).size !== raw.length) return false;
  return raw.every(value => question.options.some(o => o.id === value));
}

export function restoreProgress(raw: unknown, questions: readonly SourceQuestion[]): Progress | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<Progress>;
  const answers: Answers = {}, drafts: Answers = {};
  const savedAnswers: Record<string, unknown> = data.answers && typeof data.answers === "object" ? data.answers : {};
  const savedDrafts: Record<string, unknown> = data.drafts && typeof data.drafts === "object" ? data.drafts : {};
  for (const q of questions) {
    const submitted = savedAnswers[q.id];
    const draft = savedDrafts[q.id];
    if (selectionIsValid(submitted, q, true)) answers[q.id] = [...submitted];
    else if (selectionIsValid(draft, q, false)) drafts[q.id] = [...draft];
  }
  return {
    current: typeof data.current === "number" && Number.isInteger(data.current) && data.current >= 0 && data.current < questions.length ? data.current : 0,
    language: data.language === "en" ? "en" : "vi",
    answers, drafts,
  };
}

export function resultStatus(q: SourceQuestion, answer: readonly Choice[] | undefined): "unanswered" | "ungraded" | "correct" | "incorrect" {
  if (!answer) return "unanswered";
  if (!q.correctAnswers || q.correctAnswers.length !== q.selectCount) return "ungraded";
  return sameAnswerSet(answer, q.correctAnswers) ? "correct" : "incorrect";
}

export function summary(questions: readonly SourceQuestion[], answers: Answers) {
  const result = {answered: 0, graded: 0, correct: 0, incorrect: 0, ungraded: 0, remaining: 0};
  for (const q of questions) {
    const status = resultStatus(q, answers[q.id]);
    if (status === "unanswered") result.remaining++;
    else {
      result.answered++;
      if (status === "ungraded") result.ungraded++;
      else {
        result.graded++;
        if (status === "correct") result.correct++;
        else result.incorrect++;
      }
    }
  }
  return result;
}