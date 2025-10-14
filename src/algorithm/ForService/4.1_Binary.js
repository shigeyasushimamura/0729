/**
 * 特に重要なポイント

ログ検索: DBクエリ前のメモリ内フィルタリングで高速化
仮想スクロール: 可変高さのアイテムにも対応（固定高さならもっとシンプル）
レート制限: スライディングウィンドウ方式で正確な制限が可能
 */
var LogSearcher = /** @class */ (function () {
    function LogSearcher(logs) {
        // logsはタイムスタンプでソート済みと仮定
        this.logs = logs;
    }
    // 指定時刻以降の最初のログのインデックスを取得
    LogSearcher.prototype.findFirstAfter = function (timestamp) {
        var left = 0;
        var right = this.logs.length - 1;
        var result = this.logs.length;
        while (left <= right) {
            var mid = Math.floor((right + left) / 2);
            if (this.logs[mid].timestamp >= timestamp) {
                result = mid;
                right = mid - 1;
            }
            else {
                left = mid + 1;
            }
        }
        return result;
    };
    // 指定時刻以前の最後のログのインデックスを取得
    LogSearcher.prototype.findLastBefore = function (timestamp) {
        var left = 0;
        var right = this.logs.length - 1;
        var result = -1;
        while (left <= right) {
            var mid = Math.floor((left + right) / 2);
            if (this.logs[mid].timestamp <= timestamp) {
                result = mid;
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }
        return result;
    };
    // 時間範囲でログを取得(O(log n + k) k=結果数)
    LogSearcher.prototype.getLogsByTimeRange = function (startTime, endTime) {
        var startIdx = this.findFirstAfter(startTime);
        var endIdx = this.findLastBefore(endTime);
        if (startIdx > endTime)
            return [];
        return this.logs.slice(startIdx, endIdx + 1);
    };
    return LogSearcher;
}());
// 使用例
var logs = [
    { timestamp: 1000, level: "info", message: "Server started" },
    { timestamp: 1500, level: "warn", message: "High memory usage" },
    { timestamp: 2000, level: "error", message: "Connection failed" },
    { timestamp: 2500, level: "info", message: "Retry successful" },
    { timestamp: 3000, level: "info", message: "Request processed" },
];
var searcher = new LogSearcher(logs);
var recentLogs = searcher.getLogsByTimeRange(1500, 2500);
console.log("Logs between 1500-2500:", recentLogs);
var VirtualScroller = /** @class */ (function () {
    function VirtualScroller(items) {
        this.items = items;
        this.cumulativeHeights = this.buildComlativeHeights(items);
    }
    VirtualScroller.prototype.buildComlativeHeights = function (items) {
        var comlative = [];
        var sum = 0;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            sum += item.height;
            comlative.push(sum);
        }
        return comlative;
    };
    /**
     * スクロール位置から最初の可視アイテムのインデックスを取得
     */
    VirtualScroller.prototype.findFirstVisibleIndex = function (scrollTop) {
        if (scrollTop <= 0)
            return 0;
        var left = 0;
        var right = this.cumulativeHeights.length - 1;
        while (left < right) {
            var mid = Math.floor((left + right) / 2);
            if (this.cumulativeHeights[mid] <= scrollTop) {
                left = mid + 1;
            }
            else {
                right = mid;
            }
        }
        return left;
    };
    /**
     * 表示領域に含まれるアイテムを取得
     */
    VirtualScroller.prototype.getVisibleItems = function (scrollTop, viewportHeight) {
        var startIndex = this.findFirstVisibleIndex(scrollTop);
        var endScrollPosition = scrollTop + viewportHeight;
        var visibleItems = [];
        var currentIndex = startIndex;
        while (currentIndex < this.items.length &&
            (currentIndex === 0
                ? 0
                : this.cumulativeHeights[currentIndex - 1]) <
                endScrollPosition) {
            visibleItems.push(this.items[currentIndex]);
            currentIndex++;
        }
        var offsetY = startIndex === 0
            ? 0
            : this.cumulativeHeights[startIndex - 1];
        return { items: visibleItems, offsetY: offsetY, startIndex: startIndex };
    };
    VirtualScroller.prototype.getTotalHeight = function () {
        return this.cumulativeHeights[this.cumulativeHeights.length - 1] || 0;
    };
    return VirtualScroller;
}());
var items = Array.from({ length: 100000 }, function (_, i) { return ({
    id: "item-".concat(i),
    height: 50 + (i % 3) * 20, // 可変高さ
    data: "Item ".concat(i),
}); });
var scroller = new VirtualScroller(items);
// スクロールイベントハンドラ内で
var scrollTop = 5000; // 現在のスクロール位置
var viewportHeight = 600; // 表示領域の高さ
var _a = scroller.getVisibleItems(scrollTop, viewportHeight), visibleItems = _a.items, offsetY = _a.offsetY, startIndex = _a.startIndex;
console.log("Visible items: ".concat(visibleItems.length, " items starting from index ").concat(startIndex));
console.log("Offset Y: ".concat(offsetY, "px"));
console.log("Total height: ".concat(scroller.getTotalHeight(), "px"));
/**
 * レート制限（Rate Limiter）

用途: APIの使用制限、DoS対策、リソース保護
効果: 古いリクエストの削除が O(log n) で高速
実例: 「1分間に100リクエストまで」の制限実装
 *
 *
 *
 */
var RateLimiter = /** @class */ (function () {
    function RateLimiter(maxRequests, windowMs) {
        this.requests = []; // タイムスタンプでソートしたもの
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    /**
     * 古いリクエストを効率的に削除 (O(log n))
     */
    RateLimiter.prototype.removeExpiredRequests = function () {
        var cutoffTime = Date.now() - this.windowMs;
        // 2分探索で有効なリクエストの開始地点を見つける
        var left = 0;
        var right = this.requests.length - 1;
        var firstValid = this.requests.length;
        while (left <= right) {
            var mid = Math.floor((left + right) / 2);
            if (this.requests[mid] > cutoffTime) {
                right = mid - 1;
                firstValid = mid;
            }
            else {
                left = mid + 1;
            }
        }
        this.requests = this.requests.slice(firstValid);
    };
    /**
     * リクエストが許可されるかチェック
     */
    RateLimiter.prototype.tryRequest = function () {
        this.removeExpiredRequests();
        if (this.requests.length < this.maxRequests) {
            this.requests.push(Date.now());
            return true;
        }
        return false;
    };
    /**
     * 次にリクエスト可能になるまでの時間をミリ秒で取得
     */
    RateLimiter.prototype.getRetryAfterMs = function () {
        if (this.requests.length < this.maxRequests) {
            return 0;
        }
        var oldestRequest = this.requests[0];
        var resetTime = oldestRequest + this.windowMs;
        return Math.max(0, resetTime - Date.now());
    };
    /**
     * 現在のリクエスト数を取得
     */
    RateLimiter.prototype.getCurrentCount = function () {
        this.removeExpiredRequests();
        return this.requests.length;
    };
    return RateLimiter;
}());
// 使用例（Express.js風のミドルウェア）
var limiter = new RateLimiter(5, 60000); // 1分間に5リクエストまで
function rateLimitMiddleware(req, res, next) {
    if (limiter.tryRequest()) {
        console.log("Request allowed. Current count: ".concat(limiter.getCurrentCount()));
        next();
    }
    else {
        var retryAfter = Math.ceil(limiter.getRetryAfterMs() / 1000);
        console.log("Rate limit exceeded. Retry after ".concat(retryAfter, " seconds"));
        res.status(429).json({
            error: "Too many requests",
            retryAfter: retryAfter,
        });
    }
}
// テスト
console.log("\n=== Rate Limiter Test ===");
for (var i = 0; i < 7; i++) {
    var allowed = limiter.tryRequest();
    console.log("Request ".concat(i + 1, ": ").concat(allowed ? "ALLOWED" : "BLOCKED", " (count: ").concat(limiter.getCurrentCount(), ")"));
    if (!allowed) {
        console.log("  Retry after: ".concat(limiter.getRetryAfterMs(), "ms"));
    }
}
