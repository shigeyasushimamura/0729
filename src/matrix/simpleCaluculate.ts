type Matrix = number[][];

function addMatrices(A: Matrix, B: Matrix): Matrix {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        throw new Error("行列サイズが一致していない");
    }
    return A.map((row, i) => {
        return row.map((value, j) => value + B[i][j]);
    });
}

const A: Matrix = [
    [1, 2, 3],
    [4, 5, 6],
];

const B: Matrix = [
    [7, 8, 9],
    [10, 11, 12],
];

const result = addMatrices(A, B);

console.log(result);
// 出力: [
//   [8, 10, 12],
//   [14, 16, 18]
// ]

function subMatrices(A: Matrix, B: Matrix): Matrix {
    if (A.length !== B.length || A[0].length !== B[0].length) {
        throw new Error("行列サイズが一致していない");
    }
    return A.map((row, i) => {
        return row.map((value, j) => value - B[i][j]);
    });
}

const result2 = subMatrices(A, B);

console.log(result2);
