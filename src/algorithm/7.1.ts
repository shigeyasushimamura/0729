// 深さ優先探索(DFS)

// DFS - 再帰版
export function dfsRecursive<T>(
  graph: Map<T, T[]>,
  start: T,
  visit?: (node: T) => void,
  visited?: Set<T>
): void {
  if (!visited) visited = new Set<T>();
  if (visited.has(start)) return;

  visit?.(start);

  for (const neigh of graph.get(start) ?? []) {
    if (!visited.has(neigh)) {
      dfsRecursive(graph, neigh, visit, visited);
    }
  }
}

const graph = new Map<string, string[]>([
  ["A", ["B", "C"]],
  ["B", ["D"]],
  ["C", ["E"]],
  ["D", []],
  ["E", []],
]);

// 再帰版の実行（訪問順を出力）
dfsRecursive(graph, "A", (node) => console.log("visit:", node));
// 出力例: A B D C E
