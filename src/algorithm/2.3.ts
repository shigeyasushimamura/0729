class Queue<T> {
    private box: (T | null)[];
    private front: number;
    private rear: number;
    private readonly qmax: number;

    constructor(qmax = 100) {
        this.qmax = qmax;
        this.box = new Array(qmax + 1).fill(null);
        this.front = 1;
        this.rear = 0;
    }

    push(item: T): void {
        if (this.rear >= this.qmax) {
            throw new Error("Queue overflow");
        }
        this.box[++this.rear] = item;
    }

    pop(): T | null {
        if (this.empty()) {
            throw new Error("Queue underflow");
        }
        const item = this.box[this.front];
        this.box[this.front++] = null;
        return item;
    }

    top(): T | null {
        if (this.empty()) {
            return null;
        }
        return this.box[this.front];
    }

    empty(): boolean {
        return this.rear < this.front;
    }
}

// 使用例
const stringQueue = new Queue<string>();
stringQueue.push("A");
stringQueue.push("B");
console.log(stringQueue.top()); // "A"
console.log(stringQueue.pop()); // "A"
console.log(stringQueue.empty()); // false

const numberQueue = new Queue<number>();
numberQueue.push(1);
numberQueue.push(2);
console.log(numberQueue.pop()); // 1
