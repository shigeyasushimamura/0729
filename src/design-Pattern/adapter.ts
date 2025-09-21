// ===== 型定義 =====
type User = { id: string; name: string };
type Order = { data: string };
type Payment = { data: string };

// 既存の多機能APIクライアント（変更不可）
interface OldAPIClient {
    fetchUser(id: string): Promise<User>;
    fetchOrders(userId: string): Promise<Order[]>;
    fetchPayments(userId: string): Promise<Payment[]>;
    sendEmail(userId: string, content: string): Promise<void>;
}

class OldAPIClientImpl implements OldAPIClient {
    async fetchUser(id: string) {
        return { id, name: "Alice" };
    }
    async fetchOrders(userId: string) {
        return [];
    }
    async fetchPayments(userId: string) {
        return [];
    }
    async sendEmail(userId: string, content: string) {/* 実装省略 */}
}

// 新しいクライアントで必要な機能だけ
interface NewAPIClient {
    fetchUser(userId: string): Promise<User>;
    fetchOrders(userId: string): Promise<Order[]>;
}

class NewAPIClientImpl implements NewAPIClient {
    async fetchUser(userId: string) {
        return { id: userId, name: "Bob" };
    }
    async fetchOrders(userId: string) {
        return [{ data: "order1" }, { data: "order2" }];
    }
}

// ===== Adapter =====
class APIClientAdapter implements OldAPIClient {
    constructor(private client: NewAPIClient) {}

    // 必要なメソッドはNewAPIClientに委譲
    async fetchUser(id: string): Promise<User> {
        return this.client.fetchUser(id);
    }

    async fetchOrders(userId: string): Promise<Order[]> {
        return this.client.fetchOrders(userId);
    }

    // 不要なメソッドは空処理 + 型安全
    async fetchPayments(userId: string): Promise<Payment[]> {
        console.warn("fetchPayments is not implemented in this adapter");
        return Promise.resolve([]);
    }

    async sendEmail(userId: string, content: string): Promise<void> {
        console.warn("sendEmail is not implemented in this adapter");
        return Promise.resolve();
    }
}

// ===== 利用例 =====
async function main() {
    const newClient = new NewAPIClientImpl();
    const adapter: OldAPIClient = new APIClientAdapter(newClient);

    const user = await adapter.fetchUser("123");
    const orders = await adapter.fetchOrders("123");
    console.log(user, orders);

    // 不要メソッドを呼んでも安全
    const payments = await adapter.fetchPayments("123");
    await adapter.sendEmail("123", "hello");
}

main();
