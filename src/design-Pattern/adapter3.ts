// 単純ケース: Service内でfactory生成
// テストや環境差し替えしたい場合は、外部注入パターン

// ---------------------------
// 統一インターフェース
// ---------------------------
interface PaymentGateway {
    charge(userId: string, amount: number): Promise<void>;
}

// ---------------------------
// 外部APIラッパー（変更不可想定）
// ---------------------------
class StripeAPI {
    async makePayment(customerId: string, cents: number) {
        console.log(`Stripe: ${customerId}に${cents}セント課金`);
    }
}

class PayPalAPI {
    async sendPayment(account: string, dollars: number) {
        console.log(`PayPal: ${account}に${dollars}ドル課金`);
    }
}

// ---------------------------
// Adapter
// ---------------------------
class StripeAdapter implements PaymentGateway {
    constructor(private stripe: StripeAPI) {}
    async charge(userId: string, amount: number) {
        await this.stripe.makePayment(userId, amount * 100);
    }
}

class PayPalAdapter implements PaymentGateway {
    constructor(private paypal: PayPalAPI) {}
    async charge(userId: string, amount: number) {
        await this.paypal.sendPayment(userId, amount);
    }
}

type GatewayType = "stripe" | "paypal";

class PaymentGatewayFactory {
    static create(type: GatewayType): PaymentGateway {
        switch (type) {
            case "stripe":
                return new StripeAdapter(new StripeAPI());
            case "paypal":
                return new PayPalAdapter(new PayPalAPI());
        }
    }
}

// service
class PaymentService {
    private gateway: PaymentGateway;

    constructor(gateway?: PaymentGateway) {
        // 外部注入がなければ内部生成
        this.gateway = gateway ?? PaymentGatewayFactory.create("paypal");
    }

    async processPayment(userId: string, amount: number) {
        await this.gateway.charge(userId, amount);
    }
}

async function main() {
    const service1 = new PaymentService();
    await service1.processPayment("user123", 40);

    // 外部注入
    const mockGateway: PaymentGateway = {
        async charge(userId: string, amount: number) {
            console.log(`Mock test`);
        },
    };
    const service2 = new PaymentService(mockGateway);
    await service2.processPayment("user456", 99);
}
