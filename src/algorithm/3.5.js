var MinHeap = /** @class */ (function () {
    function MinHeap(maxSize) {
        this.box = new Array(maxSize);
        this.size = 0;
    }
    MinHeap.prototype.swap = function (i, j) {
        var temp = this.box[i];
        this.box[i] = this.box[j];
        this.box[j] = temp;
    };
    MinHeap.prototype.insert = function (item) {
        var i = this.size;
        this.box[i] = item;
        this.size++;
        while (i > 0 && this.box[i] < this.box[Math.floor((i - 1) / 2)]) {
            this.swap(i, Math.floor((i - 1) / 2));
            i = Math.floor((i - 1) / 2);
        }
    };
    MinHeap.prototype.findMin = function () {
        return this.box[0];
    };
    MinHeap.prototype.deleteMin = function () {
        if (this.size === 0)
            return;
        this.box[0] = this.box[this.size - 1];
        this.size--;
        var i = 0;
        while (2 * i + 1 < this.size) {
            var k = 2 * i + 1;
            if (k + 1 < this.size && this.box[k] > this.box[k + 1]) {
                k++;
            }
            if (this.box[i] <= this.box[k])
                break;
            this.swap(i, k);
            i = k;
        }
    };
    return MinHeap;
}());
function heapSort(arr) {
    var n = arr.length;
    var heap = new MinHeap(n);
    // 要素をヒープに入れる
    for (var i = 0; i < n; i++) {
        heap.insert(arr[i]);
    }
    // 最小値を順番に取り出す
    var sorted = [];
    for (var i = 0; i < n; i++) {
        sorted.push(heap.findMin());
        heap.deleteMin();
    }
    return sorted;
}
// 使用例
var arr = [5, 3, 8, 4, 1, 9, 2];
console.log("元の配列:", arr);
var sortedArr = heapSort(arr);
console.log("ヒープソート後:", sortedArr);
