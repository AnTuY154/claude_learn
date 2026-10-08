export type AgentKind = "web" | "document";
export type CoverageStatus = "well-covered" | "partial" | "missing";

export type ResearchTask = {
  id: string;
  title: string;
  goal: string;
  agent: AgentKind;
};

export type Finding = {
  task: ResearchTask;
  content: string;
  iteration: number;
};

export type CoverageItem = {
  subtopic: string;
  status: CoverageStatus;
  reason: string;
  suggested_agent: AgentKind;
};

export const WEB_SEARCH_LIMITATION =
  "Live web search chưa được bật trong demo này. Web agent dùng kiến thức của model và phải đánh dấu nội dung cần xác minh; không được tuyên bố đã duyệt web.";

export function routeAgent(requested: unknown, hasDocumentContext: boolean): AgentKind {
  return requested === "document" && hasDocumentContext ? "document" : "web";
}

export function buildCoordinatorPrompt(topic: string, documentContext: string) {
  return `ORIGINAL TOPIC\n${topic}\n\nAVAILABLE DOCUMENT CONTEXT\n${documentContext || "None"}\n\nCreate a broad research plan with at least 5 distinct subtopics. Choose agent \"document\" only when the supplied document can answer the task; otherwise choose \"web\". Return JSON only:\n{\"research_goal\":\"...\",\"tasks\":[{\"id\":\"task-1\",\"title\":\"...\",\"goal\":\"...\",\"agent\":\"web|document\"}]}`;
}

export function normalizePlan(value: unknown, hasDocumentContext: boolean) {
  if (!value || typeof value !== "object") throw new Error("Kế hoạch không phải object");
  const record = value as Record<string, unknown>;
  if (typeof record.research_goal !== "string" || !Array.isArray(record.tasks)) {
    throw new Error("Kế hoạch thiếu research_goal hoặc tasks");
  }
  const tasks = record.tasks.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`Task ${index + 1} không hợp lệ`);
    const task = raw as Record<string, unknown>;
    if (typeof task.title !== "string" || typeof task.goal !== "string") {
      throw new Error(`Task ${index + 1} thiếu title hoặc goal`);
    }
    return {
      id: typeof task.id === "string" ? task.id : `task-${index + 1}`,
      title: task.title,
      goal: task.goal,
      agent: routeAgent(task.agent, hasDocumentContext),
    };
  });
  if (tasks.length < 5) throw new Error("Coordinator phải tạo ít nhất 5 subtopics");
  return { researchGoal: record.research_goal, tasks };
}

export function buildSubagentPrompt(input: {
  topic: string;
  researchGoal: string;
  task: ResearchTask;
  documentContext: string;
  priorFindings: Finding[];
}) {
  const { topic, researchGoal, task, documentContext, priorFindings } = input;
  const sourceRule = task.agent === "document"
    ? "Use only the supplied document context. State when it is insufficient."
    : WEB_SEARCH_LIMITATION;
  return `ORIGINAL TOPIC\n${topic}\n\nRESEARCH GOAL\n${researchGoal}\n\nASSIGNED TASKS\n- ${task.title}: ${task.goal}\n\nRELEVANT DOCUMENT CONTEXT\n${documentContext || "None"}\n\nPRIOR FINDINGS PASSED BY COORDINATOR\n${priorFindings.length ? JSON.stringify(priorFindings) : "None"}\n\nSOURCE RULE\n${sourceRule}\n\nReturn a concise finding with evidence boundaries, uncertainty, and practical implications.`;
}

export function normalizeCoverage(value: unknown): CoverageItem[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as Record<string, unknown>).coverage)) {
    throw new Error("Coverage response không hợp lệ");
  }
  return ((value as Record<string, unknown>).coverage as unknown[]).map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`Coverage ${index + 1} không hợp lệ`);
    const item = raw as Record<string, unknown>;
    if (typeof item.subtopic !== "string" || typeof item.reason !== "string") {
      throw new Error(`Coverage ${index + 1} thiếu dữ liệu`);
    }
    const status: CoverageStatus = ["well-covered", "partial", "missing"].includes(String(item.status))
      ? item.status as CoverageStatus
      : "missing";
    return {
      subtopic: item.subtopic,
      status,
      reason: item.reason,
      suggested_agent: item.suggested_agent === "document" ? "document" : "web",
    };
  });
}

export function coveragePercent(coverage: CoverageItem[]) {
  if (!coverage.length) return 0;
  const score = coverage.reduce((sum, item) => sum + (item.status === "well-covered" ? 1 : item.status === "partial" ? 0.5 : 0), 0);
  return Math.round((score / coverage.length) * 100);
}

export function buildRefinementTasks(coverage: CoverageItem[], hasDocumentContext: boolean): ResearchTask[] {
  return coverage.filter(({ status }) => status !== "well-covered").map((gap, index) => ({
    id: `refine-${index + 1}`,
    title: gap.subtopic,
    goal: `Close this coverage gap: ${gap.reason}`,
    agent: routeAgent(gap.suggested_agent, hasDocumentContext),
  }));
}

export function extractJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Claude không trả JSON object");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
