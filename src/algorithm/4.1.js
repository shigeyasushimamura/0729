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
var priceRanges = [
    { min: 0, max: 1000, label: "安価" },
    { min: 1001, max: 5000, label: "中価格" },
    { min: 5001, max: 10000, label: "高価格" },
];
var findPriceRange;
(function (ranges, price) {
    var l = 0;
    var r = ranges.length - 1;
    while (l <= r) {
        var m = Math.floor((l + r) / 2);
        if (price < ranges[m].min)
            r = m - 1;
        else if (price > ranges[m].max)
            l = m + 1;
        else
            return ranges[m].label;
    }
    return "範囲外";
});
function findFirstAfterTimeStamp(logs, targetTime) {
    var left = 0, right = logs.length - 1;
    var result = logs.length;
    while (left <= right) {
        var mid = Math.floor((left + right) / 2);
        if (logs[mid].timestamp >= targetTime) {
            result = mid;
            right = mid - 1;
        }
        else {
            left = mid + 1;
        }
    }
    return result;
}
console.log("タイムスタンプでソートされたログから、特定時刻以降のデータを取得");
var logs = [{ timestamp: 100, message: "No.1" }, { timestamp: 101, message: "No.2" }, { timestamp: 102, message: "No.3" }, { timestamp: 103, message: "No.4" }, { timestamp: 104, message: "No.5" }];
console.log(findFirstAfterTimeStamp(logs, 101));
