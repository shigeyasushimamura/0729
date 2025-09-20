// 単方向リストのノード
var SinglyNode = /** @class */ (function () {
    function SinglyNode(data, next) {
        if (next === void 0) { next = null; }
        this.data = data;
        this.next = next;
    }
    return SinglyNode;
}());
// 単方向リスト
var SinglyLinkedList = /** @class */ (function () {
    function SinglyLinkedList() {
        this.head = new SinglyNode(""); // 番兵ノード
    }
    SinglyLinkedList.prototype.insert = function (k, item) {
        var l = this.head;
        while (k > 1) {
            if (l.next === null)
                throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        var p = new SinglyNode(item, l.next);
        l.next = p;
    };
    SinglyLinkedList.prototype.remove = function (k) {
        var l = this.head;
        while (k > 1) {
            if (l.next === null)
                throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        if (l.next === null)
            throw new Error("削除対象がありません");
        l.next = l.next.next;
    };
    SinglyLinkedList.prototype.access = function (k) {
        var l = this.head;
        while (k > 0) {
            if (l.next === null)
                throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        return l.data;
    };
    SinglyLinkedList.prototype.print = function () {
        var l = this.head.next;
        var elems = [];
        while (l !== null) {
            elems.push(l.data);
            l = l.next;
        }
        console.log(elems.join(" -> "));
    };
    return SinglyLinkedList;
}());
// ===========================================================
// 双方向リストのノード
var DoublyNode = /** @class */ (function () {
    function DoublyNode(data, next, prev) {
        if (next === void 0) { next = null; }
        if (prev === void 0) { prev = null; }
        this.data = data;
        this.next = next;
        this.prev = prev;
    }
    return DoublyNode;
}());
// 双方向リスト
var DoublyLinkedList = /** @class */ (function () {
    function DoublyLinkedList() {
        this.head = new DoublyNode(""); // ダミーノード
    }
    DoublyLinkedList.prototype.insert = function (k, item) {
        var l = this.head;
        while (k > 1) {
            if (l.next === null)
                throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        var p = new DoublyNode(item, l.next, l);
        if (l.next !== null) {
            l.next.prev = p;
        }
        l.next = p;
    };
    DoublyLinkedList.prototype.remove = function (k) {
        var l = this.head;
        while (k > 1) {
            if (l.next === null)
                throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        if (l.next === null)
            throw new Error("削除対象がありません");
        var target = l.next;
        l.next = target.next;
        if (target.next !== null) {
            target.next.prev = l;
        }
    };
    DoublyLinkedList.prototype.access = function (k) {
        var l = this.head;
        while (k > 0) {
            if (l.next === null)
                throw new Error("範囲外です");
            l = l.next;
            k--;
        }
        return l.data;
    };
    DoublyLinkedList.prototype.printForward = function () {
        var l = this.head.next;
        var elems = [];
        while (l !== null) {
            elems.push(l.data);
            l = l.next;
        }
        console.log("→ " + elems.join(" <-> "));
    };
    DoublyLinkedList.prototype.printBackward = function () {
        // 最後尾まで移動
        var l = this.head;
        while (l.next !== null)
            l = l.next;
        var elems = [];
        while (l.prev !== null) {
            elems.push(l.data);
            l = l.prev;
        }
        console.log("← " + elems.join(" <-> "));
    };
    return DoublyLinkedList;
}());
// ===========================================================
// 動作テスト
var sl = new SinglyLinkedList();
sl.insert(1, "A");
sl.insert(2, "B");
sl.insert(2, "C"); // A, C, B
sl.print(); // A -> C -> B
sl.remove(2);
sl.print(); // A -> B
var dl = new DoublyLinkedList();
dl.insert(1, "X");
dl.insert(2, "Y");
dl.insert(2, "Z"); // X, Z, Y
dl.printForward(); // → X <-> Z <-> Y
dl.printBackward(); // ← Y <-> Z <-> X
