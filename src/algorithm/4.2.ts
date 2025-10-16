class Vertex {
    data: number;
    l: Vertex | null;
    r: Vertex | null;

    constructor(data: number = 0) {
        this.data = data;
        this.l = null;
        this.r = null;
    }
}

/**
 * 探索木に値xが含まれているかを再帰的に確認
 * @param p 現在のノード
 * @param x 探索する値
 * @returns 含まれていれば1、そうでないなら0
 */
function member(p: Vertex | null, x: number): number {
    if (p == null) {
        return 0;
    }

    if (p.data === x) {
        return 1;
    } else if (p.data > x) {
        return member(p.l, x);
    } else {
        return member(p.r, x);
    }
}

/**
 * 探索木に値xを挿入する
 * @param p 挿入を開始するノード(通常は根)
 * @param x 挿入する値
 */
function insert(p: Vertex, x: number): void {
    if (p.data > x) {
        if (p.l !== null) {
            return insert(p.l, x);
        } else {
            p.l = new Vertex(x);
        }
    } else if (p.data < x) {
        if (p.r !== null) {
            return insert(p.r, x);
        } else {
            p.r = new Vertex(x);
        }
    }

    // p.data === xの場合は挿入しない(重複を許可しない場合)
}

/**
 * 探索木から値xを持つノードを削除する(ルートノードは削除できない可能性)
 * @param root 探索木の根のノード
 * @param x 削除する値
 */
function deleteb(root: Vertex, x: number): void {
    let parent: Vertex = root; // 削除対象ノードpの親ノード
    let p: Vertex | null = root; // 削除対象ノード

    // 削除対象ノードpとその親parantを見つける
    do {
        parent = p as Vertex;

        // 次のノードに進む
        // 注：ルートノード自体の削除に対応していない
        if (x < parent.data) {
            p = parent.l;
        } else {
            p = parent.r;
        }
    } while (p !== null && x !== p.data);

    if (p === null) {
        return;
    }
    // この時点でpは削除対象ノード。
    if (p.l === null || p.r === null) {
        let q: Vertex | null; // pの残された子ノード　または null

        if (p.r === null) {
            q = p.l;
        } else {
            q = p.r;
        }

        // 親parentのリンクをqに付け替える
        if (parent.l === p) {
            parent.l = q;
        } else {
            parent.r = q;
        }
    } // 削除対象ノードpの子が2この場合
    //この場合、削除対象ノードの次に大きいノードを張り付ける
    else {
        let q: Vertex | null = parent.r; //parentの右部分木の最小値ノード
        let g: Vertex = p as Vertex; // qの親ノード

        // qがpの右部分木で最小値を見つける
        // q-> l がnullになるまで左へ進む
        while (q !== null && q.l !== null) {
            g = q;
            q = q.l;
        }

        // この時点でqは跡継ぎノード
        if (q === null) return;

        p.data = q.data; // 削除対象ノードpのデータに、跡継ぎノードを挿入
        // 次に、値を盗られた後継ノードqを削除します。qは右部分木の最小値なので、必ず子が0個または1個（右の子のみ）です。

        //         p	削除対象ノード（値がxのノード）	変更なし
        // q	後継ノード（p.rから左へ辿った最小値）	q.lは必ずnull
        // g	qの親ノード	qの直前のノード

        // qとparentが等しい。つまりqがpの右(p->r)である場合
        //         ケース 1: 後継ノード q が p の直下の右子である場合
        // これは、pの右の子（p.r）が既に右部分木の中で最小値である場合です。
        if (q === parent) {
            p.r = q.r;
        } // qとgが異なる
        //         ケース 2: 後継ノード q が p の右子よりさらに左下にある場合
        // これは、p.rが左の子を持っているため、whileループを1回以上回った場合です
        else {
            g.l = q.r;
        }
    }
}

// 使用例
const root = new Vertex(10); // 根ノードを10で作成
insert(root, 5);
insert(root, 15);
insert(root, 3);
insert(root, 7);
insert(root, 12);
insert(root, 18);
insert(root, 16);
insert(root, 17);

console.log("Member 7:", member(root, 7)); // 1
console.log("Member 9:", member(root, 9)); // 0

deleteb(root, 15); // 子が2つのノードを削除 (後継ノード: 16)
deleteb(root, 3); // 子が0つのノードを削除
deleteb(root, 12); // 子が1つのノードを削除

console.log("Member 15:", member(root, 15)); // 0
console.log("Member 3:", member(root, 3)); // 0
console.log("Member 12:", member(root, 12)); // 0
console.log("Member 16:", member(root, 16)); // 1 (15の場所へ移動)
