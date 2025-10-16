var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// ドメインオブジェクト定義
var Address = /** @class */ (function () {
    function Address(country, region, zipCode) {
        this.country = country;
        this.region = region;
        this.zipCode = zipCode;
    }
    Address.prototype.accept = function (visitor) {
        return visitor.visitAddress(this);
    };
    return Address;
}());
var Customer = /** @class */ (function () {
    function Customer(id, name, email, tier, address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.tier = tier;
        this.address = address;
    }
    Customer.prototype.accept = function (visitor) {
        return visitor.visitCustomer(this);
    };
    return Customer;
}());
var Product = /** @class */ (function () {
    function Product(id, name, price, category, restrictedCountries) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.restrictedCountries = restrictedCountries;
    }
    Product.prototype.accept = function (visitor) {
        return visitor.visitProduct(this);
    };
    return Product;
}());
var LineItem = /** @class */ (function () {
    function LineItem(product, quantity, discount) {
        if (discount === void 0) { discount = 0; }
        this.product = product;
        this.quantity = quantity;
        this.discount = discount;
    }
    LineItem.prototype.accept = function (visitor) {
        return visitor.visitLineItem(this);
    };
    LineItem.prototype.getSubtotal = function () {
        return this.product.price * this.quantity * (1 - this.discount);
    };
    return LineItem;
}());
var Order = /** @class */ (function () {
    function Order(id, customer, lineItems, createdAt) {
        this.id = id;
        this.customer = customer;
        this.lineItems = lineItems;
        this.createdAt = createdAt;
    }
    Order.prototype.accept = function (visitor) {
        return visitor.visitOrder(this);
    };
    return Order;
}());
// ============================================================================
// Visitor Package: Abstract Base
// ============================================================================
var OrderVisitor = /** @class */ (function () {
    function OrderVisitor() {
    }
    OrderVisitor.prototype.visitAllLineItems = function (items) {
        var _this = this;
        items.forEach(function (item) { return item.accept(_this); });
    };
    OrderVisitor.prototype.visitCustomerAndAddress = function (customer) {
        customer.accept(this);
        customer.address.accept(this);
    };
    return OrderVisitor;
}());
var OrderValidationVisitor = /** @class */ (function (_super) {
    __extends(OrderValidationVisitor, _super);
    function OrderValidationVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.errors = [];
        return _this;
    }
    OrderValidationVisitor.prototype.visitOrder = function (order) {
        this.errors = [];
        this.validateOrder(order);
        this.visitCustomerAndAddress(order.customer);
        this.visitAllLineItems(order.lineItems);
        return this.errors;
    };
    OrderValidationVisitor.prototype.visitLineItem = function (item) {
        this.validateLineItem(item);
        item.product.accept(this);
        return this.errors;
    };
    OrderValidationVisitor.prototype.visitProduct = function (product) {
        this.validateProduct(product);
        return this.errors;
    };
    OrderValidationVisitor.prototype.visitCustomer = function (customer) {
        this.validateCustomer(customer);
        return this.errors;
    };
    OrderValidationVisitor.prototype.visitAddress = function (address) {
        this.validateAddress(address);
        return this.errors;
    };
    OrderValidationVisitor.prototype.validateOrder = function (order) {
        if (order.lineItems.length === 0) {
            this.errors.push({
                level: "error",
                message: "Order must have at least one line item",
                context: "Order:".concat(order.id),
            });
        }
    };
    OrderValidationVisitor.prototype.validateLineItem = function (item) {
        if (item.quantity <= 0) {
            this.errors.push({
                level: "error",
                message: "Quantity must be positive",
                context: "Product:".concat(item.product.id),
            });
        }
        if (item.discount < 0 || item.discount > 1) {
            this.errors.push({
                level: "error",
                message: "Discount must be between 0 and 1",
                context: "Product:".concat(item.product.id),
            });
        }
    };
    OrderValidationVisitor.prototype.validateProduct = function (product) {
        if (product.price <= 0) {
            this.errors.push({
                level: "error",
                message: "Price must be positive",
                context: "Product:".concat(product.id),
            });
        }
    };
    OrderValidationVisitor.prototype.validateCustomer = function (customer) {
        if (!customer.email.includes("@")) {
            this.errors.push({
                level: "error",
                message: "Invalid email format",
                context: "Customer:".concat(customer.id),
            });
        }
    };
    OrderValidationVisitor.prototype.validateAddress = function (address) {
        if (!address.zipCode || address.zipCode.length === 0) {
            this.errors.push({
                level: "warning",
                message: "Zip code is missing",
                context: "Address:".concat(address.country),
            });
        }
    };
    return OrderValidationVisitor;
}(OrderVisitor));
var OrderPermissionVisitor = /** @class */ (function (_super) {
    __extends(OrderPermissionVisitor, _super);
    function OrderPermissionVisitor(userCountry, userTier) {
        var _this = _super.call(this) || this;
        _this.userCountry = userCountry;
        _this.userTier = userTier;
        return _this;
    }
    OrderPermissionVisitor.prototype.visitOrder = function (order) {
        var _a, _b;
        var result = {
            allowed: true,
            restrictions: [],
        };
        // Customer の country チェック
        var customerResult = order.customer.accept(this);
        if (!customerResult.allowed) {
            return customerResult;
        }
        (_a = result.restrictions).push.apply(_a, customerResult.restrictions);
        // 全 LineItem をチェック
        for (var _i = 0, _c = order.lineItems; _i < _c.length; _i++) {
            var item = _c[_i];
            var itemResult = item.accept(this);
            if (!itemResult.allowed) {
                return itemResult;
            }
            (_b = result.restrictions).push.apply(_b, itemResult.restrictions);
        }
        return result;
    };
    OrderPermissionVisitor.prototype.visitLineItem = function (item) {
        return item.product.accept(this);
    };
    OrderPermissionVisitor.prototype.visitProduct = function (product) {
        if (product.restrictedCountries.includes(this.userCountry)) {
            return {
                allowed: false,
                deniedReason: "Product ".concat(product.id, " is restricted in ").concat(this.userCountry),
                restrictions: [],
            };
        }
        var restrictions = [];
        if (this.userTier === "bronze" && product.category === "premium") {
            restrictions.push("Premium product ".concat(product.id, " requires Silver tier or higher"));
        }
        return {
            allowed: restrictions.length === 0,
            deniedReason: restrictions.length > 0 ? restrictions[0] : undefined,
            restrictions: restrictions,
        };
    };
    OrderPermissionVisitor.prototype.visitCustomer = function (customer) {
        if (customer.address.country !== this.userCountry) {
            return {
                allowed: false,
                deniedReason: "Cross-country order not allowed: ".concat(customer.address.country),
                restrictions: [],
            };
        }
        return { allowed: true, restrictions: [] };
    };
    OrderPermissionVisitor.prototype.visitAddress = function (address) {
        return { allowed: true, restrictions: [] };
    };
    return OrderPermissionVisitor;
}(OrderVisitor));
var OrderPriceVisitor = /** @class */ (function (_super) {
    __extends(OrderPriceVisitor, _super);
    function OrderPriceVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.breakdown = {
            subtotal: 0,
            tierDiscount: 0,
            volumeDiscount: 0,
            tax: 0,
            total: 0,
            productCount: 0,
            uniqueProducts: new Set(),
        };
        return _this;
    }
    OrderPriceVisitor.prototype.visitOrder = function (order) {
        var _this = this;
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
        order.lineItems.forEach(function (item) {
            var subtotal = item.getSubtotal();
            _this.breakdown.subtotal += subtotal;
            _this.breakdown.productCount += item.quantity;
            _this.breakdown.uniqueProducts.add(item.product.id);
        });
        // Tier ベースのディスカウント
        var tierDiscounts = {
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
        var taxRate = order.customer.address.country === "JP" ? 0.1 : 0.08;
        var afterDiscount = this.breakdown.subtotal -
            this.breakdown.tierDiscount - this.breakdown.volumeDiscount;
        this.breakdown.tax = afterDiscount * taxRate;
        this.breakdown.total = afterDiscount + this.breakdown.tax;
        return this.breakdown;
    };
    OrderPriceVisitor.prototype.visitLineItem = function (item) {
        return this.breakdown;
    };
    OrderPriceVisitor.prototype.visitProduct = function (product) {
        return this.breakdown;
    };
    OrderPriceVisitor.prototype.visitCustomer = function (customer) {
        return this.breakdown;
    };
    OrderPriceVisitor.prototype.visitAddress = function (address) {
        return this.breakdown;
    };
    return OrderPriceVisitor;
}(OrderVisitor));
var OrderAuditTrailVisitor = /** @class */ (function (_super) {
    __extends(OrderAuditTrailVisitor, _super);
    function OrderAuditTrailVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.trail = [];
        return _this;
    }
    OrderAuditTrailVisitor.prototype.visitOrder = function (order) {
        var _this = this;
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
        order.lineItems.forEach(function (item) { return item.accept(_this); });
        return this.trail;
    };
    OrderAuditTrailVisitor.prototype.visitLineItem = function (item) {
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
    };
    OrderAuditTrailVisitor.prototype.visitProduct = function (product) {
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
    };
    OrderAuditTrailVisitor.prototype.visitCustomer = function (customer) {
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
    };
    OrderAuditTrailVisitor.prototype.visitAddress = function (address) {
        this.trail.push({
            timestamp: new Date(),
            entityType: "Address",
            entityId: "".concat(address.country, "-").concat(address.region),
            details: {
                country: address.country,
                region: address.region,
                zipCode: address.zipCode,
            },
        });
        return this.trail;
    };
    return OrderAuditTrailVisitor;
}(OrderVisitor));
// ============================================================================
// Demo: Usage
// ============================================================================
var sampleOrder = new Order("ORD-001", new Customer("CUST-001", "Alice Johnson", "alice@example.com", "gold", new Address("JP", "Tokyo", "100-0001")), [
    new LineItem(new Product("PROD-001", "Laptop", 1200, "premium", ["CN", "RU"]), 1, 0.05),
    new LineItem(new Product("PROD-002", "Mouse", 50, "standard", []), 5, 0.1),
    new LineItem(new Product("PROD-003", "Keyboard", 150, "premium", ["KP"]), 2, 0),
], new Date("2025-01-15"));
// Validation
console.log("=== Validation ===");
var validationVisitor = new OrderValidationVisitor();
var validationErrors = sampleOrder.accept(validationVisitor);
console.log("Validation errors:", validationErrors);
// Permission Check
console.log("\n=== Permission Check ===");
var permissionVisitor = new OrderPermissionVisitor("JP", "gold");
var permissionResult = sampleOrder.accept(permissionVisitor);
console.log("Permission result:", permissionResult);
// Price Calculation
console.log("\n=== Price Calculation ===");
var priceVisitor = new OrderPriceVisitor();
var priceBreakdown = sampleOrder.accept(priceVisitor);
console.log("Price breakdown:", priceBreakdown);
// Audit Trail
console.log("\n=== Audit Trail ===");
var auditVisitor = new OrderAuditTrailVisitor();
var auditTrail = sampleOrder.accept(auditVisitor);
console.log("Audit trail:", JSON.stringify(auditTrail, null, 2));
