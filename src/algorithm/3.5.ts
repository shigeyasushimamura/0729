class MinHeap {
    private box: number[];
    private size: number;

    constructor(maxSize: number) {
        this.box = new Array(maxSize);
        this.size = 0;
    }

    private swap(i: number, j: number): void {
        const temp = this.box[i];
        this.box[i] = this.box[j];
        this.box[j] = temp;
    }

    insert(item: number): void {
        let i = this.size;
        this.box[i] = item;
        this.size++;

        while (i > 0 && this.box[i] < this.box[Math.floor((i - 1) / 2)]) {
            this.swap(i, Math.floor((i - 1) / 2));
            i = Math.floor((i - 1) / 2);
        }
    }

    findMin(): number {
        return this.box[0];
    }

    deleteMin(): void {
        if (this.size === 0) return;
        this.box[0] = this.box[this.size - 1];
        this.size--;

        let i = 0;
        while (2 * i + 1 < this.size) {
            let k = 2 * i + 1;
            if (k + 1 < this.size && this.box[k] > this.box[k + 1]) {
                k++;
            }
            if (this.box[i] <= this.box[k]) break;

            this.swap(i, k);
            i = k;
        }
    }
}

function heapSort(arr: number[]): number[] {
    const n = arr.length;
    const heap = new MinHeap(n);

    // 要素をヒープに入れる
    for (let i = 0; i < n; i++) {
        heap.insert(arr[i]);
    }

    // 最小値を順番に取り出す
    const sorted: number[] = [];
    for (let i = 0; i < n; i++) {
        sorted.push(heap.findMin());
        heap.deleteMin();
    }

    return sorted;
}

// 使用例
const arr = [5, 3, 8, 4, 1, 9, 2];
console.log("元の配列:", arr);
const sortedArr = heapSort(arr);
console.log("ヒープソート後:", sortedArr);

function swap(a: number[], i: number, j: number): void {
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
}

// max-heap版 (親>=子を保証する)
function heapify(a: number[], i: number, n: number): void {
    let k = 2 * i; //左の子
    if (k <= n) {
        // 右の子があり、左より大きければ選択
        k++;
    }

    // 子の方が大きければswap
    if (a[i] < a[k]) {
        swap(a, i, k);
        heapify(a, k, n);
    }
}

function makeHeap(a: number[], n: number): void {
    for (let i = Math.floor(n / 2); i >= 1; i--) {
        heapify(a, i, n);
    }
}

function heapSort2(a: number[]): number[] {
    const n = a.length - 1;
    makeHeap(a, n);
    for (let i = n; i >= 2; i--) {
        swap(a, 1, i);
        heapify(a, 1, i - 1);
    }
    return a;
}

let arr2 = [0, 4, 10, 3, 5, 1];
console.log("before:", arr2.slice(1));
console.log("after:", heapSort2(arr2).slice(1));

type Tuple = number[];

// 辞書順でソートするバケットソート
function bucketSortLex(arr: Tuple[], index = 0): Tuple[] {
    if (arr.length <= 1) return arr;

    // バケットを作る（Mapでキー: number -> 配列）
    const buckets = new Map<number, Tuple[]>();
    const emptyBucket: Tuple[] = []; // indexが存在しない短い配列用

    for (const t of arr) {
        if (index < t.length) {
            const key = t[index];
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key)!.push(t);
        } else {
            emptyBucket.push(t); // 短い配列はここに入れる
        }
    }

    // キー順にソートして再帰的にマージ
    const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
    let result: Tuple[] = [...emptyBucket]; // 短い配列を先に出す（辞書順）

    for (const key of sortedKeys) {
        const bucket = buckets.get(key)!;
        result = result.concat(bucketSortLex(bucket, index + 1));
    }

    return result;
}

// --- 使用例 ---
const arr3: Tuple[] = [
    [3, 1],
    [2, 4, 5],
    [3, 0, 2],
    [2, 4],
    [1],
    [3],
];

const sorted = bucketSortLex(arr3);
console.log(sorted);

/* 出力
[
  [1],
  [2, 4],
  [2, 4, 5],
  [3],
  [3, 0, 2],
  [3, 1]
]
*/
