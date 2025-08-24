// ===== 型安全性を強化した基本型定義 =====

type TransactionId = string & { readonly __brand: unique symbol };
type UserId = string & { readonly __brand: unique symbol };
type ResourceId = string & { readonly __brand: unique symbol };
type Timestamp = Date & { readonly __brand: unique symbol };

// 結果型の定義
interface TransactionMetadata {
    transactionId: TransactionId;
    startTime: Timestamp;
    endTime?: Timestamp;
    duration?: number;
    retryCount: number;
    tags: Readonly<Record<string, string>>;
}

interface TransactionError {
    code: string;
    message: string;
    cause?: Error;
    retryable: boolean;
    context?: Record<string, unknown>;
}

type TransactionResult<T = void> =
    | {
        readonly success: true;
        readonly data: T;
        readonly metadata: TransactionMetadata;
    }
    | {
        readonly success: false;
        readonly error: TransactionError;
        readonly metadata: TransactionMetadata;
    };

// ===== パフォーマンス・信頼性のための設定 =====

interface RetryPolicy {
    readonly maxAttempts: number;
    readonly backoffStrategy: "exponential" | "linear" | "fixed";
    readonly baseDelayMs: number;
    readonly maxDelayMs: number;
    readonly retryableErrors: readonly string[];
}

interface CircuitBreakerConfig {
    readonly failureThreshold: number;
    readonly recoveryTimeoutMs: number;
    readonly monitoringPeriodMs: number;
}

interface PerformanceConfig {
    readonly timeoutMs: number;
    readonly retryPolicy?: RetryPolicy;
    readonly circuitBreaker?: CircuitBreakerConfig;
    readonly enableMetrics: boolean;
}

// ===== 責任別にコンテキストを分離（改良版） =====

interface AuthorizationContext {
    readonly requiredPermission: string;
    readonly user: User;
    readonly resourceId?: ResourceId;
    readonly resourceType?: string;
    readonly additionalClaims?: Readonly<Record<string, unknown>>;
}

interface AuditContext {
    readonly operationName: string;
    readonly entityType: string;
    readonly entityId: ResourceId;
    readonly performedBy: UserId;
    readonly businessData?: Readonly<Record<string, unknown>>;
    readonly businessImpact?: string;
    readonly complianceLevel: "low" | "medium" | "high" | "critical";
}

interface NotificationContext {
    readonly eventType: string;
    readonly targetEntity: {
        readonly type: string;
        readonly id: ResourceId;
    };
    readonly eventData?: Readonly<Record<string, unknown>>;
    readonly recipients?: readonly string[];
    readonly priority: "low" | "normal" | "high" | "urgent";
    readonly deliveryMode: "async" | "sync";
}

interface BusinessContext {
    readonly operationType: string;
    readonly domainContext: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
    readonly correlationId?: string;
}

interface MetricsContext {
    readonly transactionId: TransactionId;
    readonly startTime: Timestamp;
    readonly tags: Readonly<Record<string, string>>;
    readonly customMetrics?: Readonly<Record<string, number>>;
}

// ===== 統合コンテキスト（改良版） =====

interface TransactionContext {
    readonly business: BusinessContext;
    readonly performance: PerformanceConfig;
    readonly metrics: MetricsContext;
    readonly authorization?: AuthorizationContext;
    readonly audit?: AuditContext;
    readonly notification?: NotificationContext;
}

// ===== より堅牢なBuilder パターン =====

class TransactionContextBuilder {
    private context: Partial<TransactionContext> = {};

    static create(transactionId?: TransactionId): TransactionContextBuilder {
        const builder = new TransactionContextBuilder();
        const id = transactionId || crypto.randomUUID() as TransactionId;
        const startTime = new Date() as Timestamp;

        // デフォルトの必須項目を設定
        builder.context.metrics = {
            transactionId: id,
            startTime,
            tags: {},
        };

        builder.context.performance = {
            timeoutMs: 30000, // 30秒デフォルト
            enableMetrics: true,
        };

        return builder;
    }

    withBusiness(
        operationType: string,
        domainContext: string,
        metadata?: Record<string, unknown>,
    ): this {
        this.context.business = {
            operationType,
            domainContext,
            metadata: metadata ? { ...metadata } : undefined,
            correlationId: crypto.randomUUID(),
        };
        return this;
    }

    withPerformance(config: Partial<PerformanceConfig>): this {
        this.context.performance = {
            ...this.context.performance!,
            ...config,
        };
        return this;
    }

    withAuthorization(
        requiredPermission: string,
        user: User,
        resourceId?: ResourceId,
        resourceType?: string,
        additionalClaims?: Record<string, unknown>,
    ): this {
        this.context.authorization = {
            requiredPermission,
            user,
            resourceId,
            resourceType,
            additionalClaims: additionalClaims
                ? { ...additionalClaims }
                : undefined,
        };
        return this;
    }

    withAudit(
        operationName: string,
        entityType: string,
        entityId: ResourceId,
        performedBy: UserId,
        complianceLevel: AuditContext["complianceLevel"],
        businessData?: Record<string, unknown>,
    ): this {
        this.context.audit = {
            operationName,
            entityType,
            entityId,
            performedBy,
            complianceLevel,
            businessData: businessData ? { ...businessData } : undefined,
        };
        return this;
    }

    withNotification(
        eventType: string,
        targetEntityType: string,
        targetEntityId: ResourceId,
        priority: NotificationContext["priority"] = "normal",
        deliveryMode: NotificationContext["deliveryMode"] = "async",
        eventData?: Record<string, unknown>,
    ): this {
        this.context.notification = {
            eventType,
            targetEntity: {
                type: targetEntityType,
                id: targetEntityId,
            },
            priority,
            deliveryMode,
            eventData: eventData ? { ...eventData } : undefined,
        };
        return this;
    }

    withMetricsTags(tags: Record<string, string>): this {
        this.context.metrics = {
            ...this.context.metrics!,
            tags: { ...this.context.metrics!.tags, ...tags },
        };
        return this;
    }

    build(): TransactionContext {
        if (!this.context.business) {
            throw new Error("Business context is required");
        }
        if (!this.context.metrics) {
            throw new Error("Metrics context is required");
        }
        if (!this.context.performance) {
            throw new Error("Performance context is required");
        }

        return this.context as TransactionContext;
    }
}

// ===== 非同期対応・メトリクス対応のBaseTransaction =====

abstract class BaseTransaction<T = void> {
    private metricsCollector?: MetricsCollector;

    constructor(
        protected readonly auditService: BusinessAuditService,
        protected readonly authService: AuthorizationService,
        protected readonly notificationService: NotificationService,
        metricsCollector?: MetricsCollector,
    ) {
        this.metricsCollector = metricsCollector;
    }

    async execute(): Promise<TransactionResult<T>> {
        const context = this.getTransactionContext();
        const startTime = performance.now();

        // メトリクス開始
        this.metricsCollector?.startTransaction(context.metrics);

        try {
            // タイムアウト設定
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(
                    () => reject(new Error("Transaction timeout")),
                    context.performance.timeoutMs,
                );
            });

            const executionPromise = this.executeWithRetry(context);

            const result = await Promise.race([
                executionPromise,
                timeoutPromise,
            ]);

            // 成功メトリクス
            const endTime = performance.now();
            const metadata: TransactionMetadata = {
                transactionId: context.metrics.transactionId,
                startTime: context.metrics.startTime,
                endTime: new Date() as Timestamp,
                duration: endTime - startTime,
                retryCount: 0, // リトライ実装時に更新
                tags: context.metrics.tags,
            };

            this.metricsCollector?.recordSuccess(
                context.metrics,
                endTime - startTime,
            );

            return { success: true, data: result, metadata };
        } catch (error) {
            const endTime = performance.now();
            const transactionError: TransactionError = {
                code: error instanceof Error
                    ? error.constructor.name
                    : "UnknownError",
                message: error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
                cause: error instanceof Error ? error : undefined,
                retryable: this.isRetryableError(error),
                context: { operationType: context.business.operationType },
            };

            const metadata: TransactionMetadata = {
                transactionId: context.metrics.transactionId,
                startTime: context.metrics.startTime,
                endTime: new Date() as Timestamp,
                duration: endTime - startTime,
                retryCount: 0, // リトライ実装時に更新
                tags: context.metrics.tags,
            };

            // エラーハンドリング
            await this.handleError(context, transactionError);

            // エラーメトリクス
            this.metricsCollector?.recordError(
                context.metrics,
                transactionError,
                endTime - startTime,
            );

            return { success: false, error: transactionError, metadata };
        }
    }

    private async executeWithRetry(context: TransactionContext): Promise<T> {
        const retryPolicy = context.performance.retryPolicy;
        let lastError: Error | null = null;

        const maxAttempts = retryPolicy?.maxAttempts ?? 1;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // 1. 事前処理（権限チェック）
                await this.preExecute(context);

                // 2. 実際のビジネスロジック
                const result = await this.executeBusinessLogic();

                // 3. 事後処理（監査ログ、通知）
                await this.postExecute(context);

                return result;
            } catch (error) {
                lastError = error instanceof Error
                    ? error
                    : new Error("Unknown error");

                // リトライ可能エラーかつ最大試行回数未満の場合
                if (
                    attempt < maxAttempts && retryPolicy &&
                    this.isRetryableError(error)
                ) {
                    const delay = this.calculateRetryDelay(
                        attempt,
                        retryPolicy,
                    );
                    await this.sleep(delay);
                    continue;
                }

                throw lastError;
            }
        }

        throw lastError!;
    }

    private async preExecute(context: TransactionContext): Promise<void> {
        if (context.authorization) {
            const authContext = context.authorization;
            const isAuthorized = await this.authService.checkPermissionAsync(
                authContext.requiredPermission,
                {
                    user: authContext.user,
                    resourceId: authContext.resourceId,
                    resourceType: authContext.resourceType,
                    additionalClaims: authContext.additionalClaims,
                },
            );

            if (!isAuthorized) {
                if (context.audit) {
                    await this.auditService.logBusinessErrorAsync(
                        `${context.audit.operationName}_DENIED`,
                        {
                            entityType: context.audit.entityType,
                            entityId: context.audit.entityId,
                            attemptedBy: authContext.user.id as UserId,
                            errorReason: "Insufficient permissions",
                            businessImpact:
                                `${context.business.operationType} blocked due to access control`,
                            timestamp: new Date() as Timestamp,
                            complianceLevel: context.audit.complianceLevel,
                        },
                    );
                }
                throw new Error("Permission denied");
            }
        }
    }

    private async postExecute(context: TransactionContext): Promise<void> {
        // 並列実行で性能向上
        const promises: Promise<void>[] = [];

        // 監査ログ
        if (context.audit) {
            promises.push(
                this.auditService.logBusinessActionAsync(
                    context.audit.operationName,
                    {
                        entityType: context.audit.entityType,
                        entityId: context.audit.entityId,
                        performedBy: context.audit.performedBy,
                        timestamp: new Date() as Timestamp,
                        businessData: context.audit.businessData,
                        businessContext: context.business.domainContext,
                        complianceLevel: context.audit.complianceLevel,
                        correlationId: context.business.correlationId,
                    },
                ),
            );
        }

        // 通知処理
        if (context.notification) {
            if (context.notification.deliveryMode === "sync") {
                promises.push(this.sendNotifications(context.notification));
            } else {
                // 非同期通知はfire-and-forget
                this.sendNotifications(context.notification).catch((error) => {
                    console.error("Notification failed:", error);
                    // 通知失敗は全体の処理を止めない
                });
            }
        }

        await Promise.all(promises);
    }

    private async handleError(
        context: TransactionContext,
        error: TransactionError,
    ): Promise<void> {
        if (context.audit) {
            await this.auditService.logBusinessErrorAsync(
                `${context.audit.operationName}_FAILED`,
                {
                    entityType: context.audit.entityType,
                    entityId: context.audit.entityId,
                    attemptedBy: context.audit.performedBy,
                    errorReason: error.message,
                    businessImpact:
                        `${context.business.operationType} failed: ${error.message}`,
                    timestamp: new Date() as Timestamp,
                    complianceLevel: context.audit.complianceLevel,
                    correlationId: context.business.correlationId,
                    errorCode: error.code,
                },
            );
        }
    }

    // ユーティリティメソッド
    private isRetryableError(error: unknown): boolean {
        if (error instanceof Error) {
            const retryableErrors = [
                "TimeoutError",
                "NetworkError",
                "ServiceUnavailableError",
            ];
            return retryableErrors.includes(error.constructor.name);
        }
        return false;
    }

    private calculateRetryDelay(
        attempt: number,
        retryPolicy: RetryPolicy,
    ): number {
        const { backoffStrategy, baseDelayMs, maxDelayMs } = retryPolicy;

        let delay = baseDelayMs;

        switch (backoffStrategy) {
            case "exponential":
                delay = Math.min(
                    baseDelayMs * Math.pow(2, attempt - 1),
                    maxDelayMs,
                );
                break;
            case "linear":
                delay = Math.min(baseDelayMs * attempt, maxDelayMs);
                break;
            case "fixed":
                delay = baseDelayMs;
                break;
        }

        // ジッター追加（雷の群れ問題回避）
        return delay + Math.random() * 1000;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // サブクラスで実装する抽象メソッド
    protected abstract getTransactionContext(): TransactionContext;
    protected abstract executeBusinessLogic(): Promise<T>;

    // Hook Methods
    protected async sendNotifications(
        notificationContext: NotificationContext,
    ): Promise<void> {
        await this.notificationService.notifyAsync(notificationContext);
    }
}

// ===== メトリクス収集インターフェース =====

interface MetricsCollector {
    startTransaction(context: MetricsContext): void;
    recordSuccess(context: MetricsContext, durationMs: number): void;
    recordError(
        context: MetricsContext,
        error: TransactionError,
        durationMs: number,
    ): void;
}

// ===== 具体的なTransaction実装例（改良版） =====

interface EmployeeCreationResult {
    readonly employeeId: ResourceId;
    readonly name: string;
    readonly type: "hourly" | "salaried";
}

export class AddHourlyEmployee extends BaseTransaction<EmployeeCreationResult> {
    constructor(
        private readonly empId: number,
        private readonly name: string,
        private readonly employeeService: EmployeeService,
        private readonly timeCardList?: readonly TimeCard[],
        private readonly currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
        metricsCollector?: MetricsCollector,
    ) {
        super(auditService, authService, notificationService, metricsCollector);
    }

    protected getTransactionContext(): TransactionContext {
        const builder = TransactionContextBuilder
            .create()
            .withBusiness("ADD_EMPLOYEE", "hourly-employee-onboarding", {
                employeeType: "Hourly",
                initialTimeCards: this.timeCardList?.length || 0,
            })
            .withPerformance({
                timeoutMs: 15000, // 従業員追加は15秒でタイムアウト
                retryPolicy: {
                    maxAttempts: 3,
                    backoffStrategy: "exponential",
                    baseDelayMs: 1000,
                    maxDelayMs: 5000,
                    retryableErrors: [
                        "NetworkError",
                        "ServiceUnavailableError",
                    ],
                },
                enableMetrics: true,
            })
            .withMetricsTags({
                operation: "add_employee",
                employee_type: "hourly",
                department: "operations",
            });

        // 権限チェックが必要な場合
        if (this.currentUser) {
            builder.withAuthorization(
                "ADD_EMPLOYEE",
                this.currentUser,
                this.empId.toString() as ResourceId,
                "Employee",
            );
        }

        // 監査ログ（従業員追加は高コンプライアンス要求）
        builder.withAudit(
            "ADD_HOURLY_EMPLOYEE",
            "Employee",
            this.empId.toString() as ResourceId,
            (this.currentUser?.id || "system") as UserId,
            "high", // コンプライアンスレベル
            {
                employeeName: this.name,
                employeeType: "Hourly",
                initialTimeCards: this.timeCardList?.length || 0,
            },
        );

        // 通知（同期的に送信）
        builder.withNotification(
            "EMPLOYEE_ADDED",
            "Employee",
            this.empId.toString() as ResourceId,
            "normal",
            "sync", // 従業員追加は同期通知
            {
                id: this.empId,
                name: this.name,
                type: "hourly",
            },
        );

        return builder.build();
    }

    protected async executeBusinessLogic(): Promise<EmployeeCreationResult> {
        const emp = EmployeeFactory.createHourlyEmployee(
            this.empId,
            this.name,
            this.timeCardList,
        );

        await this.employeeService.addEmployeeAsync(this.empId, emp);

        return {
            employeeId: this.empId.toString() as ResourceId,
            name: this.name,
            type: "hourly",
        };
    }
}

// ===== 高パフォーマンスな読み取り専用Transaction =====

export class GetEmployeeListTransaction
    extends BaseTransaction<readonly Employee[]> {
    constructor(
        private readonly queryParams: EmployeeQueryParams,
        private readonly employeeService: EmployeeService,
        private readonly currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
        metricsCollector?: MetricsCollector,
    ) {
        super(auditService, authService, notificationService, metricsCollector);
    }

    protected getTransactionContext(): TransactionContext {
        const builder = TransactionContextBuilder
            .create()
            .withBusiness("READ_EMPLOYEES", "employee-query")
            .withPerformance({
                timeoutMs: 5000, // 読み取りは高速
                enableMetrics: true,
                // リトライなし（読み取りは冪等なので）
            })
            .withMetricsTags({
                operation: "query",
                resource: "employees",
                query_type: "list",
            });

        // 読み取り専用操作では軽量な権限チェック
        if (this.currentUser) {
            builder.withAuthorization("READ_EMPLOYEES", this.currentUser);
        }

        // 読み取り操作は低コンプライアンス、監査ログなし

        return builder.build();
    }

    protected async executeBusinessLogic(): Promise<readonly Employee[]> {
        return await this.employeeService.getEmployeesAsync(this.queryParams);
    }
}

// ===== 使用例（改良版） =====

async function example() {
    const metricsCollector = new PrometheusMetricsCollector();

    // 高信頼性が必要な操作
    const addEmpTx = new AddHourlyEmployee(
        1,
        "Alice",
        employeeService,
        timeCards,
        currentUser,
        auditService,
        authService,
        notificationService,
        metricsCollector,
    );

    const result = await addEmpTx.execute();

    if (result.success) {
        console.log(`Employee added: ${result.data.employeeId}`);
        console.log(`Transaction completed in ${result.metadata.duration}ms`);
    } else {
        console.error(`Transaction failed: ${result.error.message}`);
        if (result.error.retryable) {
            console.log("Error is retryable");
        }
    }

    // 高パフォーマンスな読み取り操作
    const queryTx = new GetEmployeeListTransaction(
        { department: "engineering" },
        employeeService,
        currentUser,
        auditService,
        authService,
        notificationService,
        metricsCollector,
    );

    const queryResult = await queryTx.execute();
    if (queryResult.success) {
        console.log(`Found ${queryResult.data.length} employees`);
    }
}
