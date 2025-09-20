// ===== フロントエンド用認証システム設計 =====

interface AuthTokens {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresAt: number;
}

interface User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
}

interface LoginCredentials {
    readonly email: string;
    readonly password: string;
}

interface AuthResult {
    readonly success: boolean;
    readonly user?: User;
    readonly tokens?: AuthTokens;
    readonly error?: string;
}

// ===== トークンストレージ（永続化） =====
interface TokenStorage {
    store(tokens: AuthTokens): Promise<void>;
    retrieve(): Promise<AuthTokens | null>;
    clear(): Promise<void>;
}

class SecureTokenStorage implements TokenStorage {
    private readonly STORAGE_KEY = "auth_tokens";

    async store(tokens: AuthTokens): Promise<void> {
        // 本来はより安全な方法（HttpOnly Cookie, Secure Storage等）
        const encrypted = await this.encrypt(JSON.stringify(tokens));
        localStorage.setItem(this.STORAGE_KEY, encrypted);
    }

    async retrieve(): Promise<AuthTokens | null> {
        const encrypted = localStorage.getItem(this.STORAGE_KEY);
        if (!encrypted) return null;

        try {
            const decrypted = await this.decrypt(encrypted);
            return JSON.parse(decrypted);
        } catch {
            await this.clear(); // 破損したトークンをクリア
            return null;
        }
    }

    async clear(): Promise<void> {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    private async encrypt(data: string): Promise<string> {
        // 実際の暗号化実装（Web Crypto API等）
        return btoa(data); // 簡易実装
    }

    private async decrypt(encrypted: string): Promise<string> {
        // 実際の復号化実装
        return atob(encrypted); // 簡易実装
    }
}

// ===== API クライアント（認証付き） =====
class AuthenticatedApiClient {
    constructor(
        private baseUrl: string,
        private tokenStorage: TokenStorage,
    ) {}

    async request<T>(
        endpoint: string,
        options: RequestInit = {},
    ): Promise<T> {
        const tokens = await this.tokenStorage.retrieve();

        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (tokens) {
            headers["Authorization"] = `Bearer ${tokens.accessToken}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // トークン期限切れの可能性
            throw new Error("UNAUTHORIZED");
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
    }
}

// ===== 認証マネージャー（メイン） =====
class AuthenticationManager {
    private currentUser: User | null = null;
    private refreshTimer: number | null = null;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor(
        private apiClient: AuthenticatedApiClient,
        private tokenStorage: TokenStorage,
    ) {
        this.initializeEventListeners();
    }

    // ===== 認証状態管理 =====
    async initialize(): Promise<void> {
        const tokens = await this.tokenStorage.retrieve();
        if (tokens && !this.isTokenExpired(tokens)) {
            try {
                // トークンが有効なら現在のユーザー情報を取得
                this.currentUser = await this.apiClient.request<User>(
                    "/auth/me",
                );
                this.scheduleTokenRefresh(tokens);
                this.emit("authenticated", this.currentUser);
            } catch (error) {
                // トークンが無効な場合
                await this.logout();
            }
        }
    }

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const result = await this.apiClient.request<{
                user: User;
                tokens: AuthTokens;
            }>("/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            this.currentUser = result.user;
            await this.tokenStorage.store(result.tokens);
            this.scheduleTokenRefresh(result.tokens);

            this.emit("authenticated", this.currentUser);

            return {
                success: true,
                user: result.user,
                tokens: result.tokens,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Login failed",
            };
        }
    }

    async logout(): Promise<void> {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }

        try {
            await this.apiClient.request("/auth/logout", { method: "POST" });
        } catch {
            // ログアウトAPI失敗は無視（トークンは削除）
        }

        this.currentUser = null;
        await this.tokenStorage.clear();
        this.emit("unauthenticated");
    }

    async refreshTokens(): Promise<boolean> {
        const tokens = await this.tokenStorage.retrieve();
        if (!tokens) return false;

        try {
            const result = await this.apiClient.request<{
                tokens: AuthTokens;
            }>("/auth/refresh", {
                method: "POST",
                body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });

            await this.tokenStorage.store(result.tokens);
            this.scheduleTokenRefresh(result.tokens);
            return true;
        } catch {
            await this.logout(); // リフレッシュ失敗時は完全ログアウト
            return false;
        }
    }

    // ===== 認証・認可チェック =====
    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    hasRole(role: string): boolean {
        return this.currentUser?.roles.includes(role) ?? false;
    }

    hasPermission(permission: string): boolean {
        return this.currentUser?.permissions.includes(permission) ?? false;
    }

    hasAnyPermission(permissions: readonly string[]): boolean {
        return permissions.some((p) => this.hasPermission(p));
    }

    requirePermission(permission: string): void {
        if (!this.hasPermission(permission)) {
            throw new Error(`Permission required: ${permission}`);
        }
    }

    // ===== イベント管理 =====
    on(event: "authenticated" | "unauthenticated", callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    private emit(event: string, ...args: any[]): void {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach((callback) => callback(...args));
    }

    // ===== 内部メソッド =====
    private isTokenExpired(tokens: AuthTokens): boolean {
        return Date.now() >= tokens.expiresAt;
    }

    private scheduleTokenRefresh(tokens: AuthTokens): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        // トークン期限の5分前にリフレッシュ
        const refreshTime = tokens.expiresAt - Date.now() - (5 * 60 * 1000);

        if (refreshTime > 0) {
            this.refreshTimer = window.setTimeout(() => {
                this.refreshTokens();
            }, refreshTime);
        }
    }

    private initializeEventListeners(): void {
        // ページ可視性変更時の処理
        document.addEventListener("visibilitychange", () => {
            if (
                document.visibilityState === "visible" && this.isAuthenticated()
            ) {
                // ページ復帰時にトークン状態確認
                this.checkTokenValidity();
            }
        });
    }

    private async checkTokenValidity(): Promise<void> {
        const tokens = await this.tokenStorage.retrieve();
        if (tokens && this.isTokenExpired(tokens)) {
            const refreshed = await this.refreshTokens();
            if (!refreshed) {
                this.emit("unauthenticated");
            }
        }
    }
}

// ===== フロントエンド用 Transaction Base =====
abstract class FrontendBaseTransaction<T = void> {
    constructor(
        private authManager: AuthenticationManager,
        private apiClient: AuthenticatedApiClient,
    ) {}

    async execute(): Promise<TransactionResult<T>> {
        const startTime = Date.now();

        try {
            // 1. 認証チェック
            if (!this.authManager.isAuthenticated()) {
                throw new Error("Authentication required");
            }

            // 2. 権限チェック
            const requiredPermissions = this.getRequiredPermissions();
            if (requiredPermissions.length > 0) {
                if (!this.authManager.hasAnyPermission(requiredPermissions)) {
                    throw new Error("Insufficient permissions");
                }
            }

            // 3. ビジネスロジック実行
            const result = await this.executeBusinessLogic();

            return {
                success: true,
                data: result,
                metadata: {
                    transactionId: crypto.randomUUID() as any,
                    startTime: new Date(startTime) as any,
                    endTime: new Date() as any,
                    duration: Date.now() - startTime,
                    retryCount: 0,
                    tags: this.getMetricsTags(),
                },
            };
        } catch (error) {
            const transactionError: TransactionError = {
                code: error instanceof Error
                    ? error.constructor.name
                    : "UnknownError",
                message: error instanceof Error
                    ? error.message
                    : "Unknown error",
                cause: error instanceof Error ? error : undefined,
                retryable: this.isRetryableError(error),
            };

            return {
                success: false,
                error: transactionError,
                metadata: {
                    transactionId: crypto.randomUUID() as any,
                    startTime: new Date(startTime) as any,
                    endTime: new Date() as any,
                    duration: Date.now() - startTime,
                    retryCount: 0,
                    tags: this.getMetricsTags(),
                },
            };
        }
    }

    // サブクラスで実装
    protected abstract getRequiredPermissions(): readonly string[];
    protected abstract executeBusinessLogic(): Promise<T>;
    protected abstract getMetricsTags(): Record<string, string>;

    private isRetryableError(error: unknown): boolean {
        if (error instanceof Error) {
            return ["NetworkError", "TimeoutError"].includes(
                error.constructor.name,
            );
        }
        return false;
    }
}

// ===== 具体的な使用例 =====
class CreateEmployeeTransaction
    extends FrontendBaseTransaction<{ employeeId: string }> {
    constructor(
        private employeeData: { name: string; email: string },
        authManager: AuthenticationManager,
        apiClient: AuthenticatedApiClient,
    ) {
        super(authManager, apiClient);
    }

    protected getRequiredPermissions(): readonly string[] {
        return ["CREATE_EMPLOYEE", "MANAGE_EMPLOYEES"];
    }

    protected getMetricsTags(): Record<string, string> {
        return {
            operation: "create_employee",
            module: "hr",
        };
    }

    protected async executeBusinessLogic(): Promise<{ employeeId: string }> {
        return await this.apiClient.request<{ employeeId: string }>(
            "/employees",
            {
                method: "POST",
                body: JSON.stringify(this.employeeData),
            },
        );
    }
}

// ===== 使用例 =====
export async function initializeApp() {
    const tokenStorage = new SecureTokenStorage();
    const apiClient = new AuthenticatedApiClient(
        "https://api.example.com",
        tokenStorage,
    );
    const authManager = new AuthenticationManager(apiClient, tokenStorage);

    // アプリ初期化時に認証状態復元
    await authManager.initialize();

    // イベントリスナー設定
    authManager.on("unauthenticated", () => {
        // ログイン画面にリダイレクト
        window.location.href = "/login";
    });

    // Transaction実行例
    if (authManager.isAuthenticated()) {
        const createEmpTx = new CreateEmployeeTransaction(
            { name: "John Doe", email: "john@example.com" },
            authManager,
            apiClient,
        );

        const result = await createEmpTx.execute();
        if (result.success) {
            console.log("Employee created:", result.data.employeeId);
        } else {
            console.error("Failed to create employee:", result.error.message);
        }
    }

    return { authManager, apiClient };
}
