function factorial(n) {
    if (n == 0) {
        return 1;
    }
    else {
        return (factorial(n - 1) * n);
    }
}
console.log(factorial(5));
console.log("-----");
function gcd(m, n) {
    if (n == 0) {
        return m;
    }
    else {
        return (gcd(n, m % n));
    }
}
console.log(gcd(108, 45));
// ホーナー法:多項式の計算
// a:多項式の係数
// x:多項式を評価したい値
// n:多項式の次数
function polynomial(a, x, n) {
    var p = a[n];
    for (var i = n - 1; i >= 0; i--) {
        p = p * x + a[i];
    }
    return p;
}
// a = [2, 3, 4]; // 定数2, xの係数3, x^2の係数4
// x = 5;
// n = 2;         // 2次多項式
console.log(polynomial([2, 3, 4], 5, 2));
