const smax = 100;

class Stack {
    private box: string[] = [];
    private top: number = 0;

    push(item: string): void {
        if (this.top >= smax) throw new Error("Stack overflow");
        this.box[++this.top] = item; // 1番目から使用
    }

    pop(): string {
        if (this.empty()) throw new Error("Stack underflow");
        return this.box[this.top--]; // topを返してからデクリメント
    }

    empty(): boolean {
        return this.top === 0; // top=0 なら空
    }

    peek(): string {
        if (this.empty()) throw new Error("Stack is empty");
        return this.box[this.top]; // topの要素を返す
    }
}
