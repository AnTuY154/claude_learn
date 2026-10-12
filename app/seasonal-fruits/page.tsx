"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { AgentLog, RecipeRecommendation, SeasonalFruit } from "@/lib/seasonal-fruits";
import styles from "./seasonal-fruits.module.css";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  fruits?: SeasonalFruit[];
  recipes?: RecipeRecommendation[];
};

type ChatResponse = {
  status?: "needs_clarification" | "completed";
  message?: string;
  fruits?: SeasonalFruit[];
  recipes?: RecipeRecommendation[];
  logs?: AgentLog[];
  error?: string;
};

const starter: ChatMessage = {
  id: 1,
  role: "assistant",
  content: "Bạn muốn tìm trái cây theo mùa nào và tại khu vực nào?",
};

export default function SeasonalFruitsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;
    const userMessage: ChatMessage = { id: Date.now(), role: "user", content: message };
    const previousMessages = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLogs([]);
    setLoading(true);

    try {
      const response = await fetch("/api/seasonal-fruits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversation: previousMessages }),
      });
      const data = await response.json() as ChatResponse;
      setLogs(data.logs ?? []);
      if (!response.ok) throw new Error(data.error || "Không thể hoàn thành nghiên cứu.");
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message || "Mình chưa có câu trả lời phù hợp.",
        fruits: data.fruits,
        recipes: data.recipes,
      }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể gửi tin nhắn.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/lesson2" className={styles.back}>← Bài học orchestration</Link>
        <span className={styles.freshness}><i /> Tìm kiếm web trực tiếp</span>
      </header>

      <section className={styles.intro}>
        <p>Trợ lý mùa vụ · Việt Nam</p>
        <h1>Hỏi mùa,<br /><em>pha vị.</em></h1>
        <span>Nhắn mùa hoặc tháng cùng địa điểm. Hai agent sẽ tìm quả đang vào mùa và chọn một công thức có nguồn cho từng loại.</span>
      </section>

      <div className={styles.workspace}>
        <section className={styles.chat} aria-label="Trò chuyện với trợ lý trái cây">
          <div className={styles.chatTop}><span>Cuộc trò chuyện</span><b>{messages.length} tin</b></div>
          <div className={styles.messages} aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`${styles.message} ${message.role === "user" ? styles.user : styles.assistant}`}>
                <span>{message.role === "user" ? "Bạn" : "Trợ lý mùa vụ"}</span>
                <p>{message.content}</p>
                {message.fruits?.map((fruit) => {
                  const recipe = message.recipes?.find(({ fruitName }) => fruitName.toLocaleLowerCase("vi") === fruit.name.toLocaleLowerCase("vi"));
                  return (
                    <div className={styles.fruitCard} key={fruit.name}>
                      <div className={styles.fruitHeading}>
                        <h2>{fruit.name}</h2>
                        <small data-confidence={fruit.confidence}>{fruit.confidence}</small>
                      </div>
                      <p>{fruit.reason}</p>
                      <div className={styles.sources}>{fruit.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div>
                      {recipe ? <div className={styles.recipe}>
                        <strong>{recipe.recipeName}</strong>
                        <p>{recipe.tasteProfile}</p>
                        <ul>{recipe.ingredients.map((ingredient) => <li key={`${ingredient.name}-${ingredient.unit}`}>{ingredient.quantity} {ingredient.unit} {ingredient.name}</li>)}</ul>
                        <ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                        <p><b>Vì sao chọn:</b> {recipe.whyRecommended}</p>
                        <div className={styles.sources}>{recipe.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">Công thức gốc ↗</a>)}</div>
                      </div> : <p className={styles.missing}>Chưa tìm được công thức có nguồn đủ rõ.</p>}
                    </div>
                  );
                })}
            </article>
            ))}
            {loading && <article className={`${styles.message} ${styles.assistant} ${styles.thinking}`}><span>Coordinator</span><p>Đang chia việc và gọi hai subagent…</p></article>}
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <label htmlFor="seasonal-question">Hỏi về mùa trái cây</label>
            <textarea
              id="seasonal-question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ví dụ: Mùa hè ở Hà Nội có quả gì và ép thế nào ngon?"
              maxLength={800}
              disabled={loading}
            />
            <div><small>{input.length}/800</small><button disabled={loading || !input.trim()}>{loading ? "Đang tìm…" : "Gửi câu hỏi"}<b>→</b></button></div>
          </form>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </section>

        <aside className={styles.logPanel} aria-live="polite">
          <div className={styles.logHeading}><div><span>Agent log</span><h2>AI đang làm gì?</h2></div><b>{logs.length}</b></div>
          {logs.length === 0 && <p className={styles.logEmpty}>Gửi một câu hỏi để xem Coordinator chia task và truyền context giữa các agent.</p>}
          <ol className={styles.logList}>
            {logs.map((log, index) => <li key={`${log.timestamp}-${index}`}>
              <i data-stage={log.stage} />
              <div><small>{new Date(log.timestamp).toLocaleTimeString("vi-VN")} · {log.actor}</small><p>{log.message}</p>
                {log.detail && <details><summary>Xem dữ liệu</summary><pre>{JSON.stringify(log.detail, null, 2)}</pre></details>}
              </div>
            </li>)}
          </ol>
        </aside>
      </div>
    </main>
  );
}
