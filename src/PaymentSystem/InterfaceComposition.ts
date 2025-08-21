// ===== 1. キャッシュ機能の組み合わせ =====
interface Cacheable<T> {
    clearCache(): void;
    invalidateCache(key: string): void;
    getCacheStats(): CacheStats;
}

interface CacheStats {
    hitRate: number;
    missCount: number;
    size: number;
}

interface UserRepository {
    findById(id: string): User | undefined;
    save(user: User): void;
    findByEmail(email: string): User | undefined;
}

// キャッシュ付きリポジトリ
interface CacheableUserRepository extends UserRepository, Cacheable<User> {}

class RedisUserRepository implements CacheableUserRepository {
    constructor(private db: Database, private cache: RedisClient) {}

    findById(id: string): User | undefined {
        // キャッシュから先に検索
        const cached = this.cache.get(`user:${id}`);
        if (cached) return JSON.parse(cached);

        // DBから取得してキャッシュに保存
        const user = this.db.findUser(id);
        if (user) this.cache.set(`user:${id}`, JSON.stringify(user));
        return user;
    }

    clearCache(): void {
        this.cache.flushall();
    }
    invalidateCache(key: string): void {
        this.cache.del(key);
    }
    getCacheStats(): CacheStats {
        return this.cache.info();
    }
}

// ===== 2. 監査ログ機能の組み合わせ =====
interface Auditable {
    enableAudit(enabled: boolean): void;
    getAuditTrail(entityId: string): AuditEntry[];
}

interface AuditEntry {
    timestamp: Date;
    action: string;
    userId: string;
    changes: Record<string, any>;
}

interface ProductRepository {
    findById(id: string): Product | undefined;
    save(product: Product): void;
    delete(id: string): void;
}

// 監査ログ付きリポジトリ
interface AuditableProductRepository extends ProductRepository, Auditable {}

class AuditableProductRepositoryImpl implements AuditableProductRepository {
    private auditEnabled = true;
    private auditLog: AuditEntry[] = [];

    constructor(
        private baseRepo: ProductRepository,
        private currentUserId: string,
    ) {}

    save(product: Product): void {
        const oldProduct = this.baseRepo.findById(product.id);
        this.baseRepo.save(product);

        if (this.auditEnabled) {
            this.auditLog.push({
                timestamp: new Date(),
                action: oldProduct ? "UPDATE" : "CREATE",
                userId: this.currentUserId,
                changes: this.calculateChanges(oldProduct, product),
            });
        }
    }

    delete(id: string): void {
        const product = this.baseRepo.findById(id);
        this.baseRepo.delete(id);

        if (this.auditEnabled && product) {
            this.auditLog.push({
                timestamp: new Date(),
                action: "DELETE",
                userId: this.currentUserId,
                changes: { deleted: product },
            });
        }
    }

    enableAudit(enabled: boolean): void {
        this.auditEnabled = enabled;
    }
    getAuditTrail(entityId: string): AuditEntry[] {
        return this.auditLog.filter((entry) =>
            entry.changes.id === entityId ||
            entry.changes.deleted?.id === entityId
        );
    }

    private calculateChanges(
        old: Product | undefined,
        current: Product,
    ): Record<string, any> {
        // 変更内容を計算
        return {/* 変更差分 */};
    }
}

// ===== 3. バージョン管理機能の組み合わせ =====
interface Versionable<T> {
    getVersion(id: string): number;
    getVersionHistory(id: string): T[];
    revertToVersion(id: string, version: number): void;
}

interface DocumentRepository {
    findById(id: string): Document | undefined;
    save(document: Document): void;
}

interface VersionableDocumentRepository
    extends DocumentRepository, Versionable<Document> {}

// ===== 4. 権限チェック機能の組み合わせ =====
interface SecureAccess {
    checkPermission(operation: string, resourceId: string): boolean;
    setSecurityContext(context: SecurityContext): void;
}

interface SecurityContext {
    userId: string;
    roles: string[];
    permissions: string[];
}

interface OrderRepository {
    findById(id: string): Order | undefined;
    save(order: Order): void;
    findByCustomerId(customerId: string): Order[];
}

interface SecureOrderRepository extends OrderRepository, SecureAccess {}

class SecureOrderRepositoryImpl implements SecureOrderRepository {
    private securityContext: SecurityContext;

    constructor(private baseRepo: OrderRepository) {}

    findById(id: string): Order | undefined {
        if (!this.checkPermission("READ", id)) {
            throw new Error("Access denied");
        }
        return this.baseRepo.findById(id);
    }

    save(order: Order): void {
        if (!this.checkPermission("WRITE", order.id)) {
            throw new Error("Access denied");
        }
        this.baseRepo.save(order);
    }

    checkPermission(operation: string, resourceId: string): boolean {
        // 権限チェックロジック
        return this.securityContext.permissions.includes(`${operation}_ORDER`);
    }

    setSecurityContext(context: SecurityContext): void {
        this.securityContext = context;
    }
}

// ===== 5. 複数機能の組み合わせ =====
// 全部盛りリポジトリ
interface FullFeaturedRepository<T>
    extends
        Transactional,
        Cacheable<T>,
        Auditable,
        Versionable<T>,
        SecureAccess {}

// 特定の組み合わせ
type CachedAuditableRepository<T> = T & Cacheable<any> & Auditable;
type SecureTransactionalRepository<T> = T & SecureAccess & Transactional;

// ===== 6. サービス層での活用 =====
class UserService {
    constructor(
        private userRepo: CacheableUserRepository & Auditable & SecureAccess,
    ) {}

    async updateUser(userId: string, updates: Partial<User>): Promise<void> {
        // 権限チェック
        if (!this.userRepo.checkPermission("UPDATE", userId)) {
            throw new Error("Insufficient permissions");
        }

        const user = this.userRepo.findById(userId);
        if (!user) throw new Error("User not found");

        // 更新実行（自動的に監査ログが記録される）
        const updatedUser = { ...user, ...updates };
        this.userRepo.save(updatedUser);

        // キャッシュ無効化
        this.userRepo.invalidateCache(`user:${userId}`);
    }

    getUserAuditTrail(userId: string): AuditEntry[] {
        return this.userRepo.getAuditTrail(userId);
    }
}

// ===== 7. 設定可能な機能組み合わせ =====
class RepositoryFactory {
    static createUserRepository(features: {
        caching?: boolean;
        auditing?: boolean;
        security?: boolean;
        transactions?: boolean;
    }): UserRepository {
        let repo: any = new BaseUserRepository();

        if (features.caching) {
            repo = new CachingDecorator(repo);
        }

        if (features.auditing) {
            repo = new AuditingDecorator(repo);
        }

        if (features.security) {
            repo = new SecurityDecorator(repo);
        }

        if (features.transactions) {
            repo = new TransactionDecorator(repo);
        }

        return repo;
    }
}

// 使用例
const userRepo = RepositoryFactory.createUserRepository({
    caching: true,
    auditing: true,
    security: true,
});

// ===== 8. 型安全な機能チェック =====
function requiresCache<T>(repo: T): repo is T & Cacheable<any> {
    return "clearCache" in repo;
}

function processRepository<T extends UserRepository>(repo: T) {
    // 基本機能は必ず使える
    const user = repo.findById("123");

    // 条件付きで追加機能を使用
    if (requiresCache(repo)) {
        repo.clearCache(); // 型安全
    }

    if ("getAuditTrail" in repo) {
        (repo as any).getAuditTrail("123");
    }
}
