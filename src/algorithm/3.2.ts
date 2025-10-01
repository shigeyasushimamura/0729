function insertionSort(arr: number[]): void {
    for (let i = 1; i < arr.length; i++) {
        let temp = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j] > temp) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = temp;
    }
}

const arr = [12, 11, 13, 5, 6];
insertionSort(arr);
console.log("Sorted array:", arr);

function insertionSortGeneric<T>(
    arr: T[],
    compareFn?: (a: T, b: T) => number,
): void {
    const cmp = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));

    for (let i = 1; i < arr.length; i++) {
        let temp = arr[i];
        let j = i - 1;
        while (j >= 0 && temp < arr[j]) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = temp;
    }
}

const numbers = [12, 11, 13, 5, 6];
insertionSortGeneric(numbers);
console.log("Sorted numbers:", numbers);

// 使用例（文字列配列）
const fruits = ["banana", "apple", "cherry"];
insertionSortGeneric(fruits);
console.log("Sorted fruits:", fruits);

// 使用例（オブジェクト配列、特定キーでソート）
const users = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
    { name: "Charlie", age: 35 },
];
insertionSortGeneric(users, (a, b) => a.age - b.age);
console.log("Sorted users by age:", users);

// バブルソート
function bubbleSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): void {
    const cmp = compareFn || ((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0));

    let n = arr.length;
    let sorted: boolean;

    do {
        sorted = true;
        n--;

        for (let i = 0; i < n; i++) {
            if (cmp(arr[i], arr[i + 1]) > 0) {
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                sorted = false;
            }
        }
    } while (!sorted);
}
