import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRecipeAgentPrompt,
  findMissingRecipeFruits,
  normalizeResearchPlan,
  type RecipeRecommendation,
  type SeasonalFruit,
} from "./seasonal-fruits.ts";

test("clarification plan never dispatches tasks", () => {
  const plan = normalizeResearchPlan({
    status: "needs_clarification",
    clarification_question: "Bạn muốn tìm ở đâu?",
    tasks: [{ title: "Should not run", goal: "No location", agent: "season-agent" }],
  });
  assert.equal(plan.status, "needs_clarification");
  assert.deepEqual(plan.tasks, []);
});

test("ready plan must include both isolated agents", () => {
  assert.throws(() => normalizeResearchPlan({
    status: "ready",
    season: "mùa hè",
    location: "Hà Nội",
    goal: "Tìm quả",
    tasks: [{ title: "Tìm quả", goal: "Tìm theo mùa", agent: "season-agent" }],
  }), /cả hai subagent/);
});

test("recipe agent receives season, location and verified fruits explicitly", () => {
  const plan = normalizeResearchPlan({
    status: "ready",
    season: "mùa hè",
    location: "Hà Nội",
    goal: "Tìm quả và công thức",
    tasks: [
      { title: "Tìm quả", goal: "Tìm theo mùa", agent: "season-agent" },
      { title: "Tìm công thức", goal: "Chọn công thức", agent: "recipe-agent" },
    ],
  });
  const fruits: SeasonalFruit[] = [{ name: "Dứa", reason: "Đúng vụ", confidence: "high", sources: [{ title: "Nguồn", url: "https://example.com" }] }];
  const prompt = buildRecipeAgentPrompt(plan, fruits, "2026-06-01");
  for (const expected of ["mùa hè", "Hà Nội", "Dứa", "VERIFIED FRUITS PASSED EXPLICITLY BY COORDINATOR"]) {
    assert.match(prompt, new RegExp(expected));
  }
});

test("coverage identifies fruits without a recipe", () => {
  const fruits: SeasonalFruit[] = [
    { name: "Dứa", reason: "Đúng vụ", confidence: "high", sources: [] },
    { name: "Xoài", reason: "Đúng vụ", confidence: "medium", sources: [] },
  ];
  const recipes: RecipeRecommendation[] = [{
    fruitName: "Dứa",
    recipeName: "Nước ép dứa",
    ingredients: [{ name: "Dứa", quantity: 200, unit: "g" }],
    steps: ["Ép dứa"],
    tasteProfile: "Chua ngọt",
    whyRecommended: "Đơn giản",
    sources: [],
  }];
  assert.deepEqual(findMissingRecipeFruits(fruits, recipes), ["Xoài"]);
});
