function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
function partition(arr, p, q) {
    var i = p;
    var j = q;
    var s = arr[p]; //pivot
    console.log("pivot:", s);
    while (i <= j) {
        while (arr[i] < s)
            i++;
        while (arr[j] > s)
            j--;
        if (i <= j) {
            console.log("swap between {".concat(arr[i], "} and {").concat(arr[j], "}"));
            swap(arr, i, j);
            i++;
            j--;
        }
    }
    return { jp: i, ip: i };
}
// --- 使用例 ---
var arr = [7, 2, 1, 6, 8, 5, 3, 4];
var _a = partition(arr, 0, arr.length - 1), jp = _a.jp, ip = _a.ip;
console.log(arr, jp, ip);
