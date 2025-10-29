import { describe, it, expect, vi } from "vitest";
import { dfsRecursive } from "./7.1.js";

describe("dfsRecursive", () => {
  it("should visit all reachable nodes in depth-first order", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B", "C"]],
      ["B", ["D"]],
      ["C", ["E"]],
      ["D", []],
      ["E", []],
    ]);

    const visit = vi.fn();
    dfsRecursive(graph, "A", visit);

    // 呼び出し順の確認
    expect(visit.mock.calls.map((call) => call[0])).toEqual([
      "A",
      "B",
      "D",
      "C",
      "E",
    ]);
  });

  it("should not revisit already visited nodes (avoid infinite loop)", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B"]],
      ["B", ["A"]], // 無向グラフ的なループ
    ]);

    const visit = vi.fn();
    dfsRecursive(graph, "A", visit);

    expect(visit.mock.calls.length).toBe(2);
    expect(visit.mock.calls.map((call) => call[0])).toEqual(["A", "B"]);
  });

  it("should handle isolated nodes correctly", () => {
    const graph = new Map<string, string[]>([
      ["A", ["B"]],
      ["B", []],
      ["C", []], // 孤立ノード
    ]);

    const visit = vi.fn();
    dfsRecursive(graph, "C", visit);

    expect(visit.mock.calls.length).toBe(1);
    expect(visit.mock.calls[0]![0]).toBe("C");
  });
});
