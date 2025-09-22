// 外部API統合をAdapterで統一する例
interface PaymentGateway {
    charge(userId: string, amount: number): Promise<void>;
}

// ---------------------------
// 2. 外部APIラッパー（既存コード、変更不可と仮定）
// ---------------------------
class StripeAPI {
    async makePayment(customerId: string, cents: number) {
        console.log(`Stripe: ${customerId}に${cents}セント課金`);
        // 実際のStripe呼び出し
    }
}

class PayPalAPI {
    async sendPayment(account: string, dollars: number) {
        console.log(`PayPal: ${account}に${dollars}ドル課金`);
        // 実際のPayPal呼び出し
    }
}

// Adapter
class StripeAdapter implements PaymentGateway {
    constructor(private stripe: StripeAPI) {}

    async charge(userId: string, amount: number): Promise<void> {
        await this.stripe.makePayment(userId, amount * 100);
    }
}

class PayPalAdapter implements PaymentGateway {
    constructor(private paypal: PayPalAPI) {}
    async charge(userId: string, amount: number): Promise<void> {
        await this.paypal.sendPayment(userId, amount);
    }
}

// サービス本体
class PaymentService {
    constructor(private gateway: PaymentGateway) {}

    async processPayment(userId: string, amount: number) {
        await this.gateway.charge(userId, amount);
    }
}

// 利用例
async function main() {
    const stripeService = new PaymentService(
        new StripeAdapter(new StripeAPI()),
    );
    const paypalService = new PaymentService(
        new PayPalAdapter(new PayPalAPI()),
    );
}

main();
