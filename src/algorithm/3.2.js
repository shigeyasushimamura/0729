function insertionSort(arr) {
    for (var i = 1; i < arr.length; i++) {
        var temp = arr[i];
        var j = i - 1;
        while (j >= 0 && arr[j] > temp) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = temp;
    }
}
var arr = [12, 11, 13, 5, 6];
insertionSort(arr);
console.log("Sorted array:", arr);
function insertionSortGeneric(arr, compareFn) {
    var cmp = compareFn || (function (a, b) { return (a > b ? 1 : a < b ? -1 : 0); });
    for (var i = 1; i < arr.length; i++) {
        var temp = arr[i];
        var j = i - 1;
        while (j >= 0 && temp < arr[j]) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = temp;
    }
}
var numbers = [12, 11, 13, 5, 6];
insertionSortGeneric(numbers);
console.log("Sorted numbers:", numbers);
// 使用例（文字列配列）
var fruits = ["banana", "apple", "cherry"];
insertionSortGeneric(fruits);
console.log("Sorted fruits:", fruits);
// 使用例（オブジェクト配列、特定キーでソート）
var users = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 35 },
];
insertionSortGeneric(users, function (a, b) { return a.age - b.age; });
console.log("Sorted users by age:", users);
