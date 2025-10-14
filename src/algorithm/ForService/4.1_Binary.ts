/**
 * 特に重要なポイント

ログ検索: DBクエリ前のメモリ内フィルタリングで高速化
仮想スクロール: 可変高さのアイテムにも対応（固定高さならもっとシンプル）
レート制限: スライディングウィンドウ方式で正確な制限が可能
 */

// ===================================================================
// 1. 時系列ログの範囲検索（最も実用的）
//  時系列ログの範囲検索

// 用途: アプリケーションログ、監査ログ、メトリクスの時間範囲検索
// 効果: 100万件のログから特定期間を O(log n) で抽出
// 実例: 「過去1時間のエラーログ」「特定時刻前後のアクセスログ」
// ===================================================================

interface Log {
    timestamp: number;
    level: "info" | "warn" | "error";
    message: string;
    userId?: string;
}

class LogSearcher {
    private logs: Log[];

    constructor(logs: Log[]) {
        // logsはタイムスタンプでソート済みと仮定
        this.logs = logs;
    }

    // 指定時刻以降の最初のログのインデックスを取得
    private findFirstAfter(timestamp: number): number {
        let left = 0;
        let right = this.logs.length - 1;
        let result = this.logs.length;

        while (left <= right) {
            const mid = Math.floor((right + left) / 2);
            if (this.logs[mid].timestamp >= timestamp) {
                result = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return result;
    }

    // 指定時刻以前の最後のログのインデックスを取得
    private findLastBefore(timestamp: number): number {
        let left = 0;
        let right = this.logs.length - 1;
        let result = -1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this.logs[mid].timestamp <= timestamp) {
                result = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return result;
    }

    // 時間範囲でログを取得(O(log n + k) k=結果数)
    getLogsByTimeRange(startTime: number, endTime: number): Log[] {
        const startIdx = this.findFirstAfter(startTime);
        const endIdx = this.findLastBefore(endTime);

        if (startIdx > endTime) return [];
        return this.logs.slice(startIdx, endIdx + 1);
    }
}

// 使用例
const logs: Log[] = [
    { timestamp: 1000, level: "info", message: "Server started" },
    { timestamp: 1500, level: "warn", message: "High memory usage" },
    { timestamp: 2000, level: "error", message: "Connection failed" },
    { timestamp: 2500, level: "info", message: "Retry successful" },
    { timestamp: 3000, level: "info", message: "Request processed" },
];

const searcher = new LogSearcher(logs);
const recentLogs = searcher.getLogsByTimeRange(1500, 2500);
console.log("Logs between 1500-2500:", recentLogs);

// 仮想スクロール（Virtual Scroll）

/**
 *
長大なチャット履歴（Slack風UI）
商品リスト（楽天やAmazonのような無限一覧）
大量データのテーブル（Excel風）
SNSフィード（Twitterのようなタイムライン）
 */

interface VirtualItem {
    id: string;
    height: number;
    data: any;
}

class VirtualScroller {
    private items: VirtualItem[];
    private cumulativeHeights: number[];

    constructor(items: VirtualItem[]) {
        this.items = items;
        this.cumulativeHeights = this.buildComlativeHeights(items);
    }

    private buildComlativeHeights(items: VirtualItem[]): number[] {
        const comlative: number[] = [];
        let sum = 0;
        for (const item of items) {
            sum += item.height;
            comlative.push(sum);
        }
        return comlative;
    }

    /**
     * スクロール位置から最初の可視アイテムのインデックスを取得
     */
    findFirstVisibleIndex(scrollTop: number): number {
        if (scrollTop <= 0) return 0;

        let left = 0;
        let right = this.cumulativeHeights.length - 1;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);

            if (this.cumulativeHeights[mid] <= scrollTop) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    /**
     * 表示領域に含まれるアイテムを取得
     */
    getVisibleItems(scrollTop: number, viewportHeight: number): {
        items: VirtualItem[];
        offsetY: number;
        startIndex: number;
    } {
        const startIndex = this.findFirstVisibleIndex(scrollTop);
        const endScrollPosition = scrollTop + viewportHeight;

        const visibleItems: VirtualItem[] = [];
        let currentIndex = startIndex;

        while (
            currentIndex < this.items.length &&
            (currentIndex === 0
                    ? 0
                    : this.cumulativeHeights[currentIndex - 1]) <
                endScrollPosition
        ) {
            visibleItems.push(this.items[currentIndex]);
            currentIndex++;
        }

        const offsetY = startIndex === 0
            ? 0
            : this.cumulativeHeights[startIndex - 1];

        return { items: visibleItems, offsetY, startIndex };
    }

    getTotalHeight(): number {
        return this.cumulativeHeights[this.cumulativeHeights.length - 1] || 0;
    }
}

const items: VirtualItem[] = Array.from({ length: 100000 }, (_, i) => ({
    id: `item-${i}`,
    height: 50 + (i % 3) * 20, // 可変高さ
    data: `Item ${i}`,
}));

const scroller = new VirtualScroller(items);

// スクロールイベントハンドラ内で
const scrollTop = 5000; // 現在のスクロール位置
const viewportHeight = 600; // 表示領域の高さ

const { items: visibleItems, offsetY, startIndex } = scroller.getVisibleItems(
    scrollTop,
    viewportHeight,
);

console.log(
    `Visible items: ${visibleItems.length} items starting from index ${startIndex}`,
);
console.log(`Offset Y: ${offsetY}px`);
console.log(`Total height: ${scroller.getTotalHeight()}px`);

/**
 * レート制限（Rate Limiter）

用途: APIの使用制限、DoS対策、リソース保護
効果: 古いリクエストの削除が O(log n) で高速
実例: 「1分間に100リクエストまで」の制限実装
 *
 *
 *
 */

class RateLimiter {
    private requests: number[] = []; // タイムスタンプでソートしたもの
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number, windowMs: number) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    /**
     * 古いリクエストを効率的に削除 (O(log n))
     */
    private removeExpiredRequests(): void {
        const cutoffTime = Date.now() - this.windowMs;

        // 2分探索で有効なリクエストの開始地点を見つける
        let left = 0;
        let right = this.requests.length - 1;
        let firstValid = this.requests.length;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (this.requests[mid] > cutoffTime) {
                right = mid - 1;
                firstValid = mid;
            } else {
                left = mid + 1;
            }
        }
        this.requests = this.requests.slice(firstValid);
    }

    /**
     * リクエストが許可されるかチェック
     */
    tryRequest(): boolean {
        this.removeExpiredRequests();

        if (this.requests.length < this.maxRequests) {
            this.requests.push(Date.now());
            return true;
        }
        return false;
    }

    /**
     * 次にリクエスト可能になるまでの時間をミリ秒で取得
     */
    getRetryAfterMs(): number {
        if (this.requests.length < this.maxRequests) {
            return 0;
        }
        const oldestRequest = this.requests[0];
        const resetTime = oldestRequest + this.windowMs;
        return Math.max(0, resetTime - Date.now());
    }

    /**
     * 現在のリクエスト数を取得
     */
    getCurrentCount(): number {
        this.removeExpiredRequests();
        return this.requests.length;
    }
}

// 使用例（Express.js風のミドルウェア）
const limiter = new RateLimiter(5, 60000); // 1分間に5リクエストまで

function rateLimitMiddleware(req: any, res: any, next: any) {
    if (limiter.tryRequest()) {
        console.log(
            `Request allowed. Current count: ${limiter.getCurrentCount()}`,
        );
        next();
    } else {
        const retryAfter = Math.ceil(limiter.getRetryAfterMs() / 1000);
        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
        res.status(429).json({
            error: "Too many requests",
            retryAfter: retryAfter,
        });
    }
}

// テスト
console.log("\n=== Rate Limiter Test ===");
for (let i = 0; i < 7; i++) {
    const allowed = limiter.tryRequest();
    console.log(
        `Request ${i + 1}: ${
            allowed ? "ALLOWED" : "BLOCKED"
        } (count: ${limiter.getCurrentCount()})`,
    );
    if (!allowed) {
        console.log(`  Retry after: ${limiter.getRetryAfterMs()}ms`);
    }
}
