function swap(arr: number[], i: number, j: number): void {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function partition(
    arr: number[],
    p: number,
    q: number,
): { i: number; j: number } {
    let i = p;
    let j = q;
    const pivot = arr[Math.floor((p + q) / 2)]; // 中央値をpivotに（安定性のため）

    while (i <= j) {
        while (arr[i] < pivot) i++;
        while (arr[j] > pivot) j--;

        if (i <= j) {
            swap(arr, i, j);
            i++;
            j--;
        }
    }

    return { i, j };
}

function quicksort(arr: number[], p: number, q: number): void {
    if (p < q) {
        const { i, j } = partition(arr, p, q);
        if (p < j) quicksort(arr, p, j); // 左部分
        if (i < q) quicksort(arr, i, q); // 右部分
    }
}

// --- 使用例 ---
const arr = [7, 2, 1, 6, 8, 5, 3, 4];
quicksort(arr, 0, arr.length - 1);
console.log(arr); // => [1,2,3,4,5,6,7,8]
