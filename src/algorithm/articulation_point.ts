type Graph = Map<number, number[]>;

function findArticulationPoints(graph: Graph): Set<number> {
    const disc = new Map<number, number>();
    const low = new Map<number, number>();
    const parent = new Map<number, number | null>();
    const visited = new Set<number>();
    const ap = new Set<number>();
    let time = 0;

    function dfs(u: number) {
        visited.add(u);
        disc.set(u, time);
        low.set(u, time);
        time++;

        let children = 0;
        for (const v of graph.get(u) || []) {
            if (!visited.has(v)) {
                children++;
                parent.set(v, u);
                dfs(v);

                // low[u] の更新
                low.set(u, Math.min(low.get(u)!, low.get(v)!));

                // u が根でない場合の切断点判定
                if (parent.get(u) !== null && low.get(v)! >= disc.get(u)!) {
                    ap.add(u);
                }

                // 根の場合
                if (parent.get(u) === null && children > 1) {
                    ap.add(u);
                }
            } else if (v !== parent.get(u)) {
                // 戻り辺（バックエッジ）
                low.set(u, Math.min(low.get(u)!, disc.get(v)!));
            }
        }
    }

    for (const u of graph.keys()) {
        if (!visited.has(u)) {
            parent.set(u, null);
            dfs(u);
        }
    }

    return ap;
}

// ===================================================
// 使用例
const g: Graph = new Map([
    [0, [1, 2]],
    [1, [0, 2]],
    [2, [0, 1, 3]],
    [3, [2, 4, 5]],
    [4, [3, 5]],
    [5, [3, 4]],
]);

console.log(findArticulationPoints(g)); // Set {2, 3}
