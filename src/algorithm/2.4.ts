class MinHeap<T> {
    private box: T[];
    private compare: (a: T, b: T) => number;

    constructor(compareFn?: (a: T, b: T) => number) {
        this.box = [null as unknown as T];
        this.compare = compareFn ?? ((a: any, b: any) => a - b);
    }

    private swap(i: number, j: number): void {
        const temp = this.box[i];
        this.box[i] = this.box[j];
        this.box[j] = temp;
    }

    insert(item: T): void {
        this.box.push(item);
        let i = this.box.length - 1;

        while (
            i > 1 && this.compare(this.box[i], this.box[Math.floor(i / 2)]) < 0
        ) {
            this.swap(i, Math.floor(i / 2));
            i = Math.floor(i / 2);
        }
    }

    findMin(): T | null {
        if (this.isEmpty()) return null;
        return this.box[1];
    }

    deleteMin(): void {
        if (this.isEmpty()) throw new Error("Heap underflow");

        const last = this.box.pop();
        if (this.isEmpty()) return;

        this.box[1] = last;

        let i = 1;
        while (2 * i < this.box.length) {
            let k = 2 * i;
            if (
                k + 1 < this.box.length &&
                this.compare(this.box[k], this.box[k + 1]) > 0
            ) {
                k++;
            }

            if (this.compare(this.box[i], this.box[k]) <= 0) {
                break;
            }
            this.swap(i, k);
            i = k;
        }
    }

    isEmpty(): boolean {
        return this.box.length <= 1;
    }

    size(): number {
        return this.box.length - 1;
    }
}

// 使用例（数値ヒープ）
const heap = new MinHeap<number>();
heap.insert(5);
heap.insert(2);
heap.insert(8);
console.log(heap.findMin()); // 2
heap.deleteMin();
console.log(heap.findMin()); // 5
console.log(heap.size()); // 2

// 使用例（文字列ヒープ、辞書順）
const strHeap = new MinHeap<string>((a, b) => a.localeCompare(b));
strHeap.insert("banana");
strHeap.insert("apple");
strHeap.insert("cherry");
console.log(strHeap.findMin()); // "apple"
strHeap.deleteMin();
console.log(strHeap.findMin()); // "banana"
