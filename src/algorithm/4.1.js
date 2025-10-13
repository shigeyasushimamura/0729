// 境界探索
// 指定した値x以下の最大要素のインデックスを求める
// 時系列データ価格帯
// 例：時刻t=1000より前の最後のイベントログを取得
// スコア80点以下のランク体を探す
// 閾値を超える直前のデータ点をみつける
/**
 * 二分探索で境界を見つける
 * @param arr 昇順にソートされた配列
 * @param x 探索したい値
 * @returns x 以下の最大値のインデックス(存在しなければ-1)
 */
var upperBound = function (arr, x) {
    var l = 0;
    var r = arr.length - 1;
    var result = -1;
    while (l <= r) {
        var m = Math.floor((l + r) / 2);
        if (arr[m] <= x) {
            result = m;
            l = m + 1;
        }
        else {
            r = m - 1;
        }
    }
    return result;
};
var timestamps = [100, 300, 550, 700, 900, 1200]; // 昇順
var query = 750;
var index = upperBound(timestamps, query);
if (index !== -1) {
    console.log("\u76F4\u524D\u306E\u30A4\u30D9\u30F3\u30C8\u6642\u523B: ".concat(timestamps[index]));
}
else {
    console.log("該当なし");
}
