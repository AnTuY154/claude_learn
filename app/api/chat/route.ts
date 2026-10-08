import Anthropic from "@anthropic-ai/sdk";
import { calculate, calculateOrderTotal, searchProducts } from "@/lib/tools";

const client = new Anthropic();
const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
const MAX_TURNS = 5;

type TraceStep = {
  turn: number;
  request: unknown;
  response: unknown;
  toolResultMessage?: unknown;
};

const tools: Anthropic.Tool[] = [
  {
    name: "calculate",
    description: "Thực hiện một phép tính số học.",
    input_schema: {
      type: "object",
      properties: {
        a: { type: "number", description: "Toán hạng bên trái" },
        operator: { type: "string", enum: ["+", "-", "*", "/", "**"] },
        b: { type: "number", description: "Toán hạng bên phải" },
      },
      required: ["a", "operator", "b"],
    },
  },
  {
    name: "search_products",
    description: "Tìm sản phẩm trong catalog đã phân nhóm và trả về giá, đơn vị, danh mục.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Tên hoặc từ khóa sản phẩm" },
        max_price: { type: "number", description: "Giá tối đa theo VND" },
      },
      required: ["query"],
    },
  },
  {
    name: "calculate_order_total",
    description: "Tính chi tiết và tổng tiền đơn hàng theo giá catalog; đơn có Táo được cộng một lần 10.000 VND tiền bìa.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              product_name: { type: "string", description: "Tên chính xác trong catalog" },
              quantity: { type: "integer", minimum: 1 },
            },
            required: ["product_name", "quantity"],
            additionalProperties: false,
          },
        },
      },
      required: ["items"],
      additionalProperties: false,
    },
  },
];

function runTool(name: string, input: unknown) {
  const value = input as Record<string, unknown>;
  if (name === "calculate") {
    return calculate(Number(value.a), String(value.operator), Number(value.b));
  }
  if (name === "search_products") {
    const maxPrice = value.max_price === undefined ? undefined : Number(value.max_price);
    return JSON.stringify(searchProducts(String(value.query ?? ""), maxPrice));
  }
  if (name === "calculate_order_total") {
    return JSON.stringify(calculateOrderTotal(value.items));
  }
  throw new Error(`Tool không tồn tại: ${name}`);
}

export async function POST(request: Request) {
  try {
    const { prompt } = (await request.json()) as { prompt?: unknown };
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 2_000) {
      return Response.json({ error: "Câu hỏi phải có từ 1 đến 2.000 ký tự." }, { status: 400 });
    }

    const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt.trim() }];
    const trace: TraceStep[] = [];
    let turn = 0;

    while (turn < MAX_TURNS) {
      turn += 1;
      const requestBody = { model, max_tokens: 1024, tools, messages };
      const requestSnapshot = structuredClone(requestBody);
      const response = await client.messages.create(requestBody);
      messages.push({ role: "assistant", content: response.content });
      const calls = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );
      const step: TraceStep = {
        turn,
        request: requestSnapshot,
        response,
      };
      trace.push(step);

      if (response.stop_reason === "end_turn") {
        const answer = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n");
        return Response.json({ answer, trace });
      }

      if (response.stop_reason === "pause_turn") continue;
      if (response.stop_reason !== "tool_use") {
        return Response.json(
          { error: `Claude dừng với lý do: ${response.stop_reason}`, trace },
          { status: 502 },
        );
      }
      if (!calls.length) {
        return Response.json({ error: "stop_reason là tool_use nhưng không có tool call.", trace }, { status: 502 });
      }

      const results = calls.map((call) => {
        try {
          const output = runTool(call.name, call.input);
          return { type: "tool_result" as const, tool_use_id: call.id, content: output };
        } catch (error) {
          const output = error instanceof Error ? error.message : "Tool gặp lỗi";
          return { type: "tool_result" as const, tool_use_id: call.id, is_error: true, content: output };
        }
      });
      const toolResultMessage: Anthropic.MessageParam = {
        role: "user",
        content: results,
      };
      step.toolResultMessage = toolResultMessage;
      messages.push(toolResultMessage);
    }
    console.warn(`Agent reached the safety cap of ${MAX_TURNS} turns.`);
    return Response.json({ error: `Claude chưa hoàn tất sau ${MAX_TURNS} lượt.`, trace }, { status: 502 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Không thể kết nối Claude API. Kiểm tra API key và thử lại." }, { status: 500 });
  }
}
