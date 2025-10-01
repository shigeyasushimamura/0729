function merge(a: number[], b: number[], p: number, n: number) {
    let h = Math.floor(n / 2);
    let i = p; // 前半の配列インデック
    let j = p + h; // 後半の配列インデックス

    // k:統合後の配列インデックス
    for (let k = p; k < p + n; k++) {
        if (j === p + n || (i < p + h && a[i] < b[j])) {
            b[k] = a[i++];
        } else {
            b[k] = a[j++];
        }
    }

    for (let k = p; k < p + n; k++) {
        a[k] = b[k];
    }
}

function msort(a: number[], b: number[], p: number, n: number) {
    if (n > 1) {
        const h = Math.floor(n / 2);
        msort(a, b, p, h);
        msort(a, b, p + h, n);
    }
}

// 使い方例
const a: number[] = [0, 5, 2, 4, 1, 3]; // 0番は無視して1から使う
const n = 5;
const b: number[] = new Array(a.length);

msort(a, b, 1, n);

console.log(a.slice(1, n + 1)); // [1, 2, 3, 4, 5]
