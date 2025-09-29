class Queue<T> {
    private box: T[] = [];
    front: number = 0;
    rear: number = 1;

    initialize() {
        this.box = [];
        this.front = 0;
        this.rear = 1;
    }

    insert(item: T) {
        this.box.push(item);
        this.rear++;
    }
    delete() {
        this.front++;
    }
    empty(): boolean {
        return this.front > this.rear;
    }
    top(): T {
        return this.box[this.front];
    }

    qtoa(): T[] {
        const result: T[] = [];
        while (!this.empty()) {
            result.push(this.top());
            this.delete();
        }
        return result;
    }
}

// バケットソート
function bucketSort(a: number[], m: number): number[] {
    const n = a.length;
    const q: Queue<number>[] = Array.from(
        { length: m + 1 },
        () => new Queue<number>(),
    );

    for (let i = 0; i <= m; i++) {
        q[i].initialize();
    }

    for (let i = 0; i < n; i++) {
        q[a[i]].insert(a[i]);
    }

    const result: number[] = [];
    for (let i = 0; i <= m; i++) {
        result.push(...q[i].qtoa());
    }

    return result;
}

//使用例
const arr = [5, 1, 4, 2, 3, 2, 5, 1];
const maxVal = Math.max(...arr);
const sorted = bucketSort(arr, maxVal);

console.log(sorted); // [1, 1, 2, 2, 3, 4, 5, 5]

// 辞書順のソート
function radixSortTuples(arr: number[][]): number[][] {
    if (arr.length === 0) return arr;

    const k = arr[0].length; //列数

    const maxVals: number[] = Array(k).fill(0);

    // 列ごとの最大値
    for (const row of arr) {
        for (let i = 0; i < k; i++) {
            if (row[i] > maxVals[i]) maxVals[i] = row[i];
        }
    }
    let sorted = [...arr];

    //最下位列から順にソート
    for (let col = k - 1; col >= 0; col--) {
        const m = maxVals[col];
        const queues: Queue<number[]>[] = Array.from(
            { length: m + 1 },
            () => new Queue<number[]>(),
        );

        // 要素をバケットに入れる
        for (const row of sorted) {
            queues[row[col]].insert(row);
        }

        // バケットを順番に取り出す
        const newSorted: number[][] = [];
        for (let i = 0; i <= m; i++) {
            newSorted.push(...queues[i].qtoa());
        }
        sorted = newSorted;
    }

    return sorted;
}

// 使用例
const tuples = [
    [3, 1, 5],
    [2, 5, 3],
    [3, 1, 2],
    [1, 5, 3],
];

const sortedTuples = radixSortTuples(tuples);
console.log(sortedTuples);
// 出力: [ [1,5,3], [2,5,3], [3,1,2], [3,1,5] ]

// 選択ソート
function swap(arr: number[], i: number, j: number): void {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function selectionSort(arr: number[]): number[] {
    const n = arr.length;

    for (let j = 0; j < n - 1; j++) {
        let min = j;
        for (let i = j + 1; j < n; j++) {
            if (arr[i] < arr[min]) {
                min = i;
            }
        }
        if (min != j) {
            swap(arr, j, min);
        }
    }
    return arr;
}

// 動作確認
const data = [64, 25, 12, 22, 11];
console.log(selectionSort(data)); // [11, 12, 22, 25, 64]
