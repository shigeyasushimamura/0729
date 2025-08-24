// ===== Template Method パターンでTransaction共通化 =====

// 元のTransaction interface（変更なし）
interface Transaction {
    execute(): void;
}

// 1. 権限チェック用のコンテキスト
interface AuthorizationContext {
    requiredPermission: string;
    user: User;
    resourceId?: string;
    resourceType?: string;
}

// 2. 監査ログ用のコンテキスト
interface AuditContext {
    operationName: string;
    entityType: string;
    entityId: string;
    performedBy: string;
    businessData?: any;
    businessImpact?: string;
}

// 3. 通知用のコンテキスト
interface NotificationContext {
    eventType: string;
    targetEntity: {
        type: string;
        id: string;
    };
    eventData?: any;
    recipients?: string[];
}

// 4. ビジネスコンテキスト（ドメイン固有の情報）
interface BusinessContext {
    operationType: string;
    domainContext: string;
    metadata?: Record<string, any>;
}

// ===== 統合コンテキスト =====

// Template Method用の統合コンテキスト
interface TransactionContext {
    business: BusinessContext;
    authorization?: AuthorizationContext;
    audit?: AuditContext;
    notification?: NotificationContext;
}

// ===== Builder パターンでコンテキスト構築 =====

class TransactionContextBuilder {
    private context: Partial<TransactionContext> = {};

    withBusiness(
        operationType: string,
        domainContext: string,
        metadata?: Record<string, any>,
    ): this {
        this.context.business = {
            operationType,
            domainContext,
            metadata,
        };
        return this;
    }

    withAuthorization(
        requiredPermission: string,
        user: User,
        resourceId?: string,
        resourceType?: string,
    ): this {
        this.context.authorization = {
            requiredPermission,
            user,
            resourceId,
            resourceType,
        };
        return this;
    }

    withAudit(
        operationName: string,
        entityType: string,
        entityId: string,
        performedBy: string,
        businessData?: any,
    ): this {
        this.context.audit = {
            operationName,
            entityType,
            entityId,
            performedBy,
            businessData,
        };
        return this;
    }

    withNotification(
        eventType: string,
        targetEntityType: string,
        targetEntityId: string,
        eventData?: any,
    ): this {
        this.context.notification = {
            eventType,
            targetEntity: {
                type: targetEntityType,
                id: targetEntityId,
            },
            eventData,
        };
        return this;
    }

    build(): TransactionContext {
        if (!this.context.business) {
            throw new Error("Business context is required");
        }
        return this.context as TransactionContext;
    }
}

abstract class BaseTransaction implements Transaction {
    constructor(
        protected auditService: BusinessAuditService,
        protected authService: AuthorizationService,
        protected notificationService: NotificationService,
    ) {}

    execute(): void {
        const context = this.getTransactionContext();

        try {
            // 1. 事前処理（権限チェック）
            this.preExecute(context);

            // 2. 実際のビジネスロジック
            this.executeBusinessLogic();

            // 3. 事後処理（監査ログ、通知）
            this.postExecute(context);
        } catch (error) {
            this.handleError(context, error);
            throw error;
        }
    }

    protected preExecute(context: TransactionContext): void {
        // 権限チェックが必要な場合のみ実行
        if (context.authorization) {
            const authContext = context.authorization;
            if (
                !this.authService.checkPermission(
                    authContext.requiredPermission,
                    {
                        user: authContext.user,
                        resourceId: authContext.resourceId,
                        resourceType: authContext.resourceType,
                    },
                )
            ) {
                // エラー監査ログ（権限エラー用の最小限の情報で）
                if (context.audit) {
                    this.auditService.logBusinessError(
                        `${context.audit.operationName}_DENIED`,
                        {
                            entityType: context.audit.entityType,
                            entityId: context.audit.entityId,
                            attemptedBy: authContext.user.id,
                            errorReason: "Insufficient permissions",
                            businessImpact:
                                `${context.business.operationType} blocked due to access control`,
                            timestamp: new Date(),
                        },
                    );
                }
                throw new Error("Permission denied");
            }
        }
    }

    protected postExecute(context: TransactionContext): void {
        // 監査ログ
        if (context.audit) {
            this.auditService.logBusinessAction(context.audit.operationName, {
                entityType: context.audit.entityType,
                entityId: context.audit.entityId,
                performedBy: context.audit.performedBy,
                timestamp: new Date(),
                businessData: context.audit.businessData,
                businessContext: context.business.domainContext,
            });
        }

        // 通知処理
        if (context.notification) {
            this.sendNotifications(context.notification);
        }
    }

    protected handleError(context: TransactionContext, error: Error): void {
        if (context.audit) {
            this.auditService.logBusinessError(
                `${context.audit.operationName}_FAILED`,
                {
                    entityType: context.audit.entityType,
                    entityId: context.audit.entityId,
                    attemptedBy: context.audit.performedBy,
                    errorReason: error.message,
                    businessImpact:
                        `${context.business.operationType} failed: ${error.message}`,
                    timestamp: new Date(),
                },
            );
        }
    }

    // サブクラスで実装する抽象メソッド
    protected abstract getTransactionContext(): TransactionContext;
    protected abstract executeBusinessLogic(): void;

    // Hook Methods
    protected sendNotifications(
        notificationContext: NotificationContext,
    ): void {
        this.notificationService.notify(notificationContext);
    }
}
// ===== 具体的なTransaction実装例 =====

export class AddHourlyEmployee extends BaseTransaction {
    constructor(
        private empId: number,
        private name: string,
        private employeeService: EmployeeService,
        private timeCardList?: TimeCard[],
        private currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
    ) {
        super(auditService, authService, notificationService);
    }

    protected getTransactionContext(): TransactionContext {
        const builder = new TransactionContextBuilder()
            .withBusiness("ADD_EMPLOYEE", "hourly-employee-onboarding", {
                employeeType: "Hourly",
                initialTimeCards: this.timeCardList?.length || 0,
            });

        // 権限チェックが必要な場合
        if (this.currentUser) {
            builder.withAuthorization(
                "ADD_EMPLOYEE",
                this.currentUser,
                this.empId.toString(),
                "Employee",
            );
        }

        // 監査ログが必要な場合
        builder.withAudit(
            "ADD_HOURLY_EMPLOYEE",
            "Employee",
            this.empId.toString(),
            this.currentUser?.id || "system",
            {
                employeeName: this.name,
                employeeType: "Hourly",
                initialTimeCards: this.timeCardList?.length || 0,
            },
        );

        // 通知が必要な場合
        builder.withNotification(
            "EMPLOYEE_ADDED",
            "Employee",
            this.empId.toString(),
            {
                id: this.empId,
                name: this.name,
                type: "hourly",
            },
        );

        return builder.build();
    }

    protected executeBusinessLogic(): void {
        const emp = EmployeeFactory.createHourlyEmployee(
            this.empId,
            this.name,
            this.timeCardList,
        );
        this.employeeService.addEmployee(this.empId, emp);
    }
}

export class AddSalariedEmployee extends BaseTransaction {
    constructor(
        private empId: number,
        private name: string,
        private salary: number,
        private employeeService: EmployeeService,
        private currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
    ) {
        super(auditService, authService, notificationService);
    }

    protected getTransactionContext(): TransactionContext {
        return {
            operationName: "ADD_SALARIED_EMPLOYEE",
            entityType: "Employee",
            entityId: this.empId.toString(),
            requiredPermission: "ADD_EMPLOYEE",
            businessContext: "salaried-employee-onboarding",
            user: this.currentUser,
        };
    }

    protected executeBusinessLogic(): void {
        const emp = EmployeeFactory.createSalariedEmployee(
            this.empId,
            this.name,
            this.salary,
        );
        this.employeeService.addEmployee(this.empId, emp);
    }

    protected getAuditData(): any {
        return {
            employeeName: this.name,
            employeeType: "Salaried",
            salary: this.salary,
            requiresHighSalaryApproval: this.salary > 100000,
        };
    }

    protected sendNotifications(context: TransactionContext): void {
        this.notificationService.notifyEmployeeAdded({
            id: this.empId,
            name: this.name,
            type: "salaried",
            salary: this.salary,
        } as any);

        // 高額給与の場合は追加通知
        if (this.salary > 100000) {
            this.notificationService.notifyHighSalaryEmployeeAdded({
                id: this.empId,
                name: this.name,
                salary: this.salary,
            });
        }
    }
}

export class DeleteEmployeeTransaction extends BaseTransaction {
    constructor(
        private empId: number,
        private employeeService: EmployeeService,
        private currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
    ) {
        super(auditService, authService, notificationService);
    }

    protected getTransactionContext(): TransactionContext {
        return {
            operationName: "DELETE_EMPLOYEE",
            entityType: "Employee",
            entityId: this.empId.toString(),
            requiredPermission: "DELETE_EMPLOYEE",
            businessContext: "employee-termination",
            user: this.currentUser,
        };
    }

    protected executeBusinessLogic(): void {
        this.employeeService.deleteEmployee(this.empId);
    }

    protected getAuditData(): any {
        // 削除前に従業員情報を取得
        const employee = this.employeeService.getEmployee(this.empId);
        return {
            employeeName: employee?.getName() || "Unknown",
            employeeType: employee?.getClassification().constructor.name ||
                "Unknown",
        };
    }
}

// ===== より複雑なTransaction例 =====

export class ProcessPayrollTransaction extends BaseTransaction {
    constructor(
        private payPeriod: string,
        private employeeService: EmployeeService,
        private payrollService: PayrollService,
        private currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
    ) {
        super(auditService, authService, notificationService);
    }

    protected getTransactionContext(): TransactionContext {
        return {
            operationName: "PROCESS_PAYROLL",
            entityType: "Payroll",
            entityId: this.payPeriod,
            requiredPermission: "PROCESS_PAYROLL",
            businessContext: "payroll-processing",
            user: this.currentUser,
        };
    }

    protected executeBusinessLogic(): void {
        this.payrollService.processPayroll(this.payPeriod);
    }

    protected getAuditData(): any {
        const payrollSummary = this.payrollService.getPayrollSummary(
            this.payPeriod,
        );
        return {
            payPeriod: this.payPeriod,
            totalEmployees: payrollSummary.employeeCount,
            totalAmount: payrollSummary.totalAmount,
            processedAt: new Date(),
        };
    }

    protected sendNotifications(context: TransactionContext): void {
        this.notificationService.notifyPayrollProcessed({
            period: this.payPeriod,
            summary: this.payrollService.getPayrollSummary(this.payPeriod),
        });
    }
}

// ===== Transaction Factory =====

class TransactionFactory {
    constructor(
        private auditService: BusinessAuditService,
        private authService: AuthorizationService,
        private notificationService: NotificationService,
        private employeeService: EmployeeService,
    ) {}

    createAddHourlyEmployeeTransaction(
        empId: number,
        name: string,
        timeCardList?: TimeCard[],
        currentUser?: User,
    ): AddHourlyEmployee {
        return new AddHourlyEmployee(
            empId,
            name,
            this.employeeService,
            timeCardList,
            currentUser,
            this.auditService,
            this.authService,
            this.notificationService,
        );
    }

    createAddSalariedEmployeeTransaction(
        empId: number,
        name: string,
        salary: number,
        currentUser?: User,
    ): AddSalariedEmployee {
        return new AddSalariedEmployee(
            empId,
            name,
            salary,
            this.employeeService,
            currentUser,
            this.auditService,
            this.authService,
            this.notificationService,
        );
    }

    createDeleteEmployeeTransaction(
        empId: number,
        currentUser?: User,
    ): DeleteEmployeeTransaction {
        return new DeleteEmployeeTransaction(
            empId,
            this.employeeService,
            currentUser,
            this.auditService,
            this.authService,
            this.notificationService,
        );
    }
}

// ===== 使用例 =====

// 従来の使い方（変更なし）
const factory = new TransactionFactory(
    auditService,
    authService,
    notificationService,
    employeeService,
);

const addHourlyTx = factory.createAddHourlyEmployeeTransaction(
    1,
    "Alice",
    timeCardList,
    currentUser,
);
addHourlyTx.execute(); // 自動的に権限チェック、監査ログ、通知が実行される

const deleteTx = factory.createDeleteEmployeeTransaction(2, currentUser);
deleteTx.execute(); // 同様に横断的関心事が自動処理される

// ===== テスト例 =====

describe("AddHourlyEmployee with Template Method", () => {
    it("should execute with all cross-cutting concerns", () => {
        const mockAudit = {
            logBusinessAction: jest.fn(),
            logBusinessError: jest.fn(),
        };
        const mockAuth = { checkPermission: jest.fn().mockReturnValue(true) };
        const mockNotification = {
            notifyEmployeeAdded: jest.fn(),
            notifyHighSalaryEmployeeAdded: jest.fn(),
        };
        const mockEmployeeService = { addEmployee: jest.fn() };

        const transaction = new AddHourlyEmployee(
            1,
            "John",
            mockEmployeeService,
            [],
            currentUser,
            mockAudit,
            mockAuth,
            mockNotification,
        );

        transaction.execute();

        // 横断的関心事が自動的に実行されることを確認
        expect(mockAuth.checkPermission).toHaveBeenCalled();
        expect(mockEmployeeService.addEmployee).toHaveBeenCalled();
        expect(mockAudit.logBusinessAction).toHaveBeenCalled();
        expect(mockNotification.notifyEmployeeAdded).toHaveBeenCalled();
    });
});

// ===== より柔軟な使用例 =====

export class ReadOnlyQueryTransaction extends BaseTransaction {
    constructor(
        private queryName: string,
        private queryService: QueryService,
        private currentUser?: User,
        auditService: BusinessAuditService,
        authService: AuthorizationService,
        notificationService: NotificationService,
    ) {
        super(auditService, authService, notificationService);
    }

    protected getTransactionContext(): TransactionContext {
        const builder = new TransactionContextBuilder()
            .withBusiness("READ_DATA", "data-access");

        // 読み取り専用操作では権限チェックのみ、監査ログ・通知は不要
        if (this.currentUser) {
            builder.withAuthorization("READ_DATA", this.currentUser);
        }

        return builder.build();
    }

    protected executeBusinessLogic(): void {
        this.queryService.executeQuery(this.queryName);
    }
}

// ===== 使用例 =====

// 必要な横断的関心事のみを設定した軽量なTransaction
const queryTx = new ReadOnlyQueryTransaction(
    "getEmployeeList",
    queryService,
    currentUser,
    auditService,
    authService,
    notificationService,
);
queryTx.execute(); // 権限チェックのみ実行、監査・通知は省略

// 全ての横断的関心事が必要な重要なTransaction
const addEmpTx = new AddHourlyEmployee(
    1,
    "Alice",
    employeeService,
    timeCards,
    currentUser,
    auditService,
    authService,
    notificationService,
);
addEmpTx.execute(); // 権限・監査・通知すべて実行
