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
