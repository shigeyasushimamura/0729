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

const upperBound = (arr: number[], x: number): number => {
    let l = 0;
    let r = arr.length - 1;
    let result = -1;

    while (l <= r) {
        const m = Math.floor((l + r) / 2);
        if (arr[m] <= x) {
            result = m;
            l = m + 1;
        } else {
            r = m - 1;
        }
    }
    return result;
};
const timestamps = [100, 300, 550, 700, 900, 1200]; // 昇順
const query = 750;

const index = upperBound(timestamps, query);
if (index !== -1) {
    console.log(`直前のイベント時刻: ${timestamps[index]}`);
} else {
    console.log("該当なし");
}


type Range = {min:number; max:number; label:string};


const priceRanges: Range[] = [
  { min: 0, max: 1000, label: "安価" },
  { min: 1001, max: 5000, label: "中価格" },
  { min: 5001, max: 10000, label: "高価格" },
];


const findPriceRange(ranges:Range[],price:number):string {
    let l=0;
    let r=ranges.length-1;
while(l<=r){
    const m = Math.floor((l+r)/2)
    if(price < ranges[m].min) r = m-1
    else if (price > ranges[m].max) l = m+1;
    else return ranges[m].label;
}
return "範囲外"
}

