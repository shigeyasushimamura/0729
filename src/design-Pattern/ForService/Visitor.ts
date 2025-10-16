interface Visitable {
    accept<T>(visitor: Visitor<T>): T;
}
interface Visitor<T> {
    visitOrder(order: Order): T;
    visitLineItem(item: LineItem): T;
    visitProduct(product: Product): T;
    visitCustomer(customer: Customer): T;
    visitAddress(address: Address): T;
}

// ドメインオブジェクト定義
class Address implements Visitable {
    constructor(
        readonly country: string,
        readonly region: string,
        readonly zipCode: string,
    ) {}

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitAddress(this);
    }
}

class Customer implements Visitable {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly email: string,
        readonly tier: "gold" | "silver" | "bronze",
        readonly address: Address,
    ) {}

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitCustomer(this);
    }
}

class Product implements Visitable {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly price: number,
        readonly category: string,
        readonly restrictedCountries: string[],
    ) {}

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitProduct(this);
    }
}

class LineItem implements Visitable {
    constructor(
        readonly product: Product,
        readonly quantity: number,
        readonly discount: number = 0,
    ) {}

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLineItem(this);
    }

    getSubtotal(): number {
        return this.product.price * this.quantity * (1 - this.discount);
    }
}

class Order implements Visitable {
    constructor(
        readonly id: string,
        readonly customer: Customer,
        readonly lineItems: LineItem[],
        readonly createdAt: Date,
    ) {}

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitOrder(this);
    }
}

// ============================================================================
// Visitor Package: Abstract Base
// ============================================================================

abstract class OrderVisitor<T> implements Visitor<T> {
    abstract visitOrder(order: Order): T;
    abstract visitLineItem(item: LineItem): T;
    abstract visitProduct(product: Product): T;
    abstract visitCustomer(customer: Customer): T;
    abstract visitAddress(address: Address): T;

    protected visitAllLineItems(items: LineItem[]): void {
        items.forEach((item) => item.accept(this));
    }

    protected visitCustomerAndAddress(customer: Customer): void {
        customer.accept(this);
        customer.address.accept(this);
    }
}

// ============================================================================
// Use Case 1: Validation Visitor
// ============================================================================

interface ValidationError {
    level: "error" | "warning";
    message: string;
    context: string;
}

class OrderValidationVisitor extends OrderVisitor<ValidationError[]> {
    private errors: ValidationError[] = [];

    visitOrder(order: Order): ValidationError[] {
        this.errors = [];
        this.validateOrder(order);
        this.visitCustomerAndAddress(order.customer);
        this.visitAllLineItems(order.lineItems);
        return this.errors;
    }

    visitLineItem(item: LineItem): ValidationError[] {
        this.validateLineItem(item);
        item.product.accept(this);
        return this.errors;
    }

    visitProduct(product: Product): ValidationError[] {
        this.validateProduct(product);
        return this.errors;
    }

    visitCustomer(customer: Customer): ValidationError[] {
        this.validateCustomer(customer);
        return this.errors;
    }

    visitAddress(address: Address): ValidationError[] {
        this.validateAddress(address);
        return this.errors;
    }

    private validateOrder(order: Order): void {
        if (order.lineItems.length === 0) {
            this.errors.push({
                level: "error",
                message: "Order must have at least one line item",
                context: `Order:${order.id}`,
            });
        }
    }

    private validateLineItem(item: LineItem): void {
        if (item.quantity <= 0) {
            this.errors.push({
                level: "error",
                message: "Quantity must be positive",
                context: `Product:${item.product.id}`,
            });
        }
        if (item.discount < 0 || item.discount > 1) {
            this.errors.push({
                level: "error",
                message: "Discount must be between 0 and 1",
                context: `Product:${item.product.id}`,
            });
        }
    }

    private validateProduct(product: Product): void {
        if (product.price <= 0) {
            this.errors.push({
                level: "error",
                message: "Price must be positive",
                context: `Product:${product.id}`,
            });
        }
    }

    private validateCustomer(customer: Customer): void {
        if (!customer.email.includes("@")) {
            this.errors.push({
                level: "error",
                message: "Invalid email format",
                context: `Customer:${customer.id}`,
            });
        }
    }

    private validateAddress(address: Address): void {
        if (!address.zipCode || address.zipCode.length === 0) {
            this.errors.push({
                level: "warning",
                message: "Zip code is missing",
                context: `Address:${address.country}`,
            });
        }
    }
}

// ============================================================================
// Use Case 2: Permission & Restriction Visitor
// ============================================================================

interface PermissionCheckResult {
    allowed: boolean;
    deniedReason?: string;
    restrictions: string[];
}

class OrderPermissionVisitor extends OrderVisitor<PermissionCheckResult> {
    constructor(private userCountry: string, private userTier: string) {
        super();
    }

    visitOrder(order: Order): PermissionCheckResult {
        const result: PermissionCheckResult = {
            allowed: true,
            restrictions: [],
        };

        // Customer の country チェック
        const customerResult = order.customer.accept(this);
        if (!customerResult.allowed) {
            return customerResult;
        }
        result.restrictions.push(...customerResult.restrictions);

        // 全 LineItem をチェック
        for (const item of order.lineItems) {
            const itemResult = item.accept(this);
            if (!itemResult.allowed) {
                return itemResult;
            }
            result.restrictions.push(...itemResult.restrictions);
        }

        return result;
    }

    visitLineItem(item: LineItem): PermissionCheckResult {
        return item.product.accept(this);
    }

    visitProduct(product: Product): PermissionCheckResult {
        if (product.restrictedCountries.includes(this.userCountry)) {
            return {
                allowed: false,
                deniedReason:
                    `Product ${product.id} is restricted in ${this.userCountry}`,
                restrictions: [],
            };
        }

        const restrictions: string[] = [];
        if (this.userTier === "bronze" && product.category === "premium") {
            restrictions.push(
                `Premium product ${product.id} requires Silver tier or higher`,
            );
        }

        return {
            allowed: restrictions.length === 0,
            deniedReason: restrictions.length > 0 ? restrictions[0] : undefined,
            restrictions,
        };
    }

    visitCustomer(customer: Customer): PermissionCheckResult {
        if (customer.address.country !== this.userCountry) {
            return {
                allowed: false,
                deniedReason:
                    `Cross-country order not allowed: ${customer.address.country}`,
                restrictions: [],
            };
        }
        return { allowed: true, restrictions: [] };
    }

    visitAddress(address: Address): PermissionCheckResult {
        return { allowed: true, restrictions: [] };
    }
}

// ============================================================================
// Use Case 3: Price Calculation & Aggregation Visitor
// ============================================================================

interface PriceBreakdown {
    subtotal: number;
    tierDiscount: number;
    volumeDiscount: number;
    tax: number;
    total: number;
    productCount: number;
    uniqueProducts: Set<string>;
}

class OrderPriceVisitor extends OrderVisitor<PriceBreakdown> {
    private breakdown: PriceBreakdown = {
        subtotal: 0,
        tierDiscount: 0,
        volumeDiscount: 0,
        tax: 0,
        total: 0,
        productCount: 0,
        uniqueProducts: new Set(),
    };

    visitOrder(order: Order): PriceBreakdown {
        this.breakdown = {
            subtotal: 0,
            tierDiscount: 0,
            volumeDiscount: 0,
            tax: 0,
            total: 0,
            productCount: 0,
            uniqueProducts: new Set(),
        };

        // 全 LineItem を処理
        order.lineItems.forEach((item) => {
            const subtotal = item.getSubtotal();
            this.breakdown.subtotal += subtotal;
            this.breakdown.productCount += item.quantity;
            this.breakdown.uniqueProducts.add(item.product.id);
        });

        // Tier ベースのディスカウント
        const tierDiscounts: Record<string, number> = {
            gold: 0.15,
            silver: 0.08,
            bronze: 0,
        };
        this.breakdown.tierDiscount = this.breakdown.subtotal *
            tierDiscounts[order.customer.tier];

        // Volume ベースのディスカウント
        if (this.breakdown.productCount > 20) {
            this.breakdown.volumeDiscount =
                (this.breakdown.subtotal - this.breakdown.tierDiscount) * 0.05;
        }

        // 税計算（Country により変動）
        const taxRate = order.customer.address.country === "JP" ? 0.1 : 0.08;
        const afterDiscount = this.breakdown.subtotal -
            this.breakdown.tierDiscount - this.breakdown.volumeDiscount;
        this.breakdown.tax = afterDiscount * taxRate;

        this.breakdown.total = afterDiscount + this.breakdown.tax;

        return this.breakdown;
    }

    visitLineItem(item: LineItem): PriceBreakdown {
        return this.breakdown;
    }

    visitProduct(product: Product): PriceBreakdown {
        return this.breakdown;
    }

    visitCustomer(customer: Customer): PriceBreakdown {
        return this.breakdown;
    }

    visitAddress(address: Address): PriceBreakdown {
        return this.breakdown;
    }
}

// ============================================================================
// Use Case 4: Audit Trail Visitor (Complex Multi-dimensional)
// ============================================================================

interface AuditEvent {
    timestamp: Date;
    entityType: string;
    entityId: string;
    details: Record<string, unknown>;
}

class OrderAuditTrailVisitor extends OrderVisitor<AuditEvent[]> {
    private trail: AuditEvent[] = [];

    visitOrder(order: Order): AuditEvent[] {
        this.trail = [];
        this.trail.push({
            timestamp: new Date(),
            entityType: "Order",
            entityId: order.id,
            details: {
                customerId: order.customer.id,
                itemCount: order.lineItems.length,
                createdAt: order.createdAt,
            },
        });

        this.visitCustomerAndAddress(order.customer);
        order.lineItems.forEach((item) => item.accept(this));

        return this.trail;
    }

    visitLineItem(item: LineItem): AuditEvent[] {
        this.trail.push({
            timestamp: new Date(),
            entityType: "LineItem",
            entityId: item.product.id,
            details: {
                quantity: item.quantity,
                discount: item.discount,
                subtotal: item.getSubtotal(),
            },
        });
        item.product.accept(this);
        return this.trail;
    }

    visitProduct(product: Product): AuditEvent[] {
        this.trail.push({
            timestamp: new Date(),
            entityType: "Product",
            entityId: product.id,
            details: {
                name: product.name,
                price: product.price,
                category: product.category,
                restrictedCountries: product.restrictedCountries,
            },
        });
        return this.trail;
    }

    visitCustomer(customer: Customer): AuditEvent[] {
        this.trail.push({
            timestamp: new Date(),
            entityType: "Customer",
            entityId: customer.id,
            details: {
                name: customer.name,
                email: customer.email,
                tier: customer.tier,
            },
        });
        return this.trail;
    }

    visitAddress(address: Address): AuditEvent[] {
        this.trail.push({
            timestamp: new Date(),
            entityType: "Address",
            entityId: `${address.country}-${address.region}`,
            details: {
                country: address.country,
                region: address.region,
                zipCode: address.zipCode,
            },
        });
        return this.trail;
    }
}

// ============================================================================
// Demo: Usage
// ============================================================================

const sampleOrder = new Order(
    "ORD-001",
    new Customer(
        "CUST-001",
        "Alice Johnson",
        "alice@example.com",
        "gold",
        new Address("JP", "Tokyo", "100-0001"),
    ),
    [
        new LineItem(
            new Product("PROD-001", "Laptop", 1200, "premium", ["CN", "RU"]),
            1,
            0.05,
        ),
        new LineItem(
            new Product("PROD-002", "Mouse", 50, "standard", []),
            5,
            0.1,
        ),
        new LineItem(
            new Product("PROD-003", "Keyboard", 150, "premium", ["KP"]),
            2,
            0,
        ),
    ],
    new Date("2025-01-15"),
);

// Validation
console.log("=== Validation ===");
const validationVisitor = new OrderValidationVisitor();
const validationErrors = sampleOrder.accept(validationVisitor);
console.log("Validation errors:", validationErrors);

// Permission Check
console.log("\n=== Permission Check ===");
const permissionVisitor = new OrderPermissionVisitor("JP", "gold");
const permissionResult = sampleOrder.accept(permissionVisitor);
console.log("Permission result:", permissionResult);

// Price Calculation
console.log("\n=== Price Calculation ===");
const priceVisitor = new OrderPriceVisitor();
const priceBreakdown = sampleOrder.accept(priceVisitor);
console.log("Price breakdown:", priceBreakdown);

// Audit Trail
console.log("\n=== Audit Trail ===");
const auditVisitor = new OrderAuditTrailVisitor();
const auditTrail = sampleOrder.accept(auditVisitor);
console.log("Audit trail:", JSON.stringify(auditTrail, null, 2));
