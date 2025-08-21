// ===== Template Method パターンでTransaction共通化 =====

// 元のTransaction interface（変更なし）
interface Transaction {
    execute(): void;
}

// Template Method用のコンテキスト情報
interface TransactionContext {
    operationName: string;
    entityType?: string;
    entityId?: string;
    requiredPermission?: string;
    businessContext?: string;
    user?: User;
}

// Template Method パターンの基底クラス
abstract class BaseTransaction implements Transaction {
    constructor(
        protected auditService: BusinessAuditService,
        protected authService: AuthorizationService,
        protected notificationService: NotificationService,
    ) {}

    // Template Method - 共通の処理フローを定義
    execute(): void {
        const context = this.getTransactionContext();

        try {
            // 1. 事前処理（権限チェック）
            this.preExecute(context);

            // 2. 実際のビジネスロジック（サブクラスで実装）
            this.executeBusinessLogic();

            // 3. 事後処理（監査ログ、通知）
            this.postExecute(context);
        } catch (error) {
            // 4. エラー処理
            this.handleError(context, error);
            throw error;
        }
    }

    // Template Methodの各ステップ
    protected preExecute(context: TransactionContext): void {
        // 権限チェック
        if (context.requiredPermission && context.user) {
            if (
                !this.authService.checkPermission(context.requiredPermission, {
                    user: context.user,
                    resourceId: context.entityId,
                })
            ) {
                this.auditService.logBusinessError(
                    `${context.operationName}_DENIED`,
                    {
                        entityType: context.entityType || "Unknown",
                        entityId: context.entityId || "Unknown",
                        attemptedBy: context.user.id,
                        errorReason: "Insufficient permissions",
                        businessImpact:
                            `${context.operationName} blocked due to access control`,
                        timestamp: new Date(),
                    },
                );
                throw new Error("Permission denied");
            }
        }
    }

    protected postExecute(context: TransactionContext): void {
        // 監査ログ
        this.auditService.logBusinessAction(context.operationName, {
            entityType: context.entityType || "Unknown",
            entityId: context.entityId || "Unknown",
            performedBy: context.user?.id || "system",
            timestamp: new Date(),
            businessData: this.getAuditData(),
            businessContext: context.businessContext,
        });

        // 通知処理
        this.sendNotifications(context);
    }

    protected handleError(context: TransactionContext, error: Error): void {
        this.auditService.logBusinessError(`${context.operationName}_FAILED`, {
            entityType: context.entityType || "Unknown",
            entityId: context.entityId || "Unknown",
            attemptedBy: context.user?.id || "system",
            errorReason: error.message,
            businessImpact: `${context.operationName} failed: ${error.message}`,
            timestamp: new Date(),
        });
    }

    // サブクラスで実装する抽象メソッド
    protected abstract getTransactionContext(): TransactionContext;
    protected abstract executeBusinessLogic(): void;

    // サブクラスでオーバーライド可能なメソッド（Hook Methods）
    protected getAuditData(): any {
        return {};
    }

    protected sendNotifications(context: TransactionContext): void {
        // デフォルトは何もしない（必要に応じてサブクラスでオーバーライド）
    }
}

// ===== 具体的なTransaction実装 =====

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
        return {
            operationName: "ADD_HOURLY_EMPLOYEE",
            entityType: "Employee",
            entityId: this.empId.toString(),
            requiredPermission: "ADD_EMPLOYEE",
            businessContext: "hourly-employee-onboarding",
            user: this.currentUser,
        };
    }

    protected executeBusinessLogic(): void {
        const emp = EmployeeFactory.createHourlyEmployee(
            this.empId,
            this.name,
            this.timeCardList,
        );
        this.employeeService.addEmployee(this.empId, emp);
    }

    protected getAuditData(): any {
        return {
            employeeName: this.name,
            employeeType: "Hourly",
            initialTimeCards: this.timeCardList?.length || 0,
        };
    }

    protected sendNotifications(context: TransactionContext): void {
        this.notificationService.notifyEmployeeAdded({
            id: this.empId,
            name: this.name,
            type: "hourly",
        } as any);
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
