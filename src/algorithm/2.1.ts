// 単方向リストのノード
class SinglyNode {
    data: string;
    next: SinglyNode | null;

    constructor(data: string, next: SinglyNode | null = null) {
        this.data = data;
        this.next = next;
    }
}

// 単方向リスト
class SinglyLinkedList {
    head: SinglyNode; // ダミーノードを使う

    constructor() {
        this.head = new SinglyNode(""); // 番兵ノード
    }

    insert(k: number, item: string): void {
        let l: SinglyNode = this.head;
        while (k > 1) {
            if (l.next === null) throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        const p = new SinglyNode(item, l.next);
        l.next = p;
    }

    remove(k: number): void {
        let l: SinglyNode = this.head;
        while (k > 1) {
            if (l.next === null) throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        if (l.next === null) throw new Error("削除対象がありません");
        l.next = l.next.next;
    }

    access(k: number): string {
        let l: SinglyNode = this.head;
        while (k > 0) {
            if (l.next === null) throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        return l.data;
    }

    print(): void {
        let l = this.head.next;
        const elems: string[] = [];
        while (l !== null) {
            elems.push(l.data);
            l = l.next;
        }
        console.log(elems.join(" -> "));
    }
}

// ===========================================================

// 双方向リストのノード
class DoublyNode {
    data: string;
    next: DoublyNode | null;
    prev: DoublyNode | null;

    constructor(
        data: string,
        next: DoublyNode | null = null,
        prev: DoublyNode | null = null,
    ) {
        this.data = data;
        this.next = next;
        this.prev = prev;
    }
}

// 双方向リスト
class DoublyLinkedList {
    head: DoublyNode;

    constructor() {
        this.head = new DoublyNode(""); // ダミーノード
    }

    insert(k: number, item: string): void {
        let l: DoublyNode = this.head;
        while (k > 1) {
            if (l.next === null) throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        const p = new DoublyNode(item, l.next, l);
        if (l.next !== null) {
            l.next.prev = p;
        }
        l.next = p;
    }

    remove(k: number): void {
        let l: DoublyNode = this.head;
        while (k > 1) {
            if (l.next === null) throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        if (l.next === null) throw new Error("削除対象がありません");
        const target = l.next;
        l.next = target.next;
        if (target.next !== null) {
            target.next.prev = l;
        }
    }

    access(k: number): string {
        let l: DoublyNode = this.head;
        while (k > 0) {
            if (l.next === null) throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        return l.data;
    }

    printForward(): void {
        let l = this.head.next;
        const elems: string[] = [];
        while (l !== null) {
            elems.push(l.data);
            l = l.next;
        }
        console.log("→ " + elems.join(" <-> "));
    }

    printBackward(): void {
        // 最後尾まで移動
        let l = this.head;
        while (l.next !== null) l = l.next;

        const elems: string[] = [];
        while (l.prev !== null) {
            elems.push(l.data);
            l = l.prev;
        }
        console.log("← " + elems.join(" <-> "));
    }
}

// ===========================================================

// 動作テスト
const sl = new SinglyLinkedList();
sl.insert(1, "A");
sl.insert(2, "B");
sl.insert(2, "C"); // A, C, B
sl.print(); // A -> C -> B
sl.remove(2);
sl.print(); // A -> B

const dl = new DoublyLinkedList();
dl.insert(1, "X");
dl.insert(2, "Y");
dl.insert(2, "Z"); // X, Z, Y
dl.printForward(); // → X <-> Z <-> Y
dl.printBackward(); // ← Y <-> Z <-> X
