// Observer インターフェース
interface Observer {
    update(message: string): void;
}

// Subject インターフェース
interface Subject {
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(message: string): void;
}

// Subject の具体実装
class ContentA implements Subject {
    private observers: Observer[] = [];

    attach(observer: Observer): void {
        this.observers.push(observer);
    }

    detach(observer: Observer): void {
        this.observers = this.observers.filter((obs) => obs !== observer);
    }

    notify(message: string): void {
        // 同期処理で順番に通知
        for (const observer of this.observers) {
            observer.update(message);
        }
    }

    // コンテンツ更新などのトリガー
    updateContent(newContent: string) {
        console.log(`ContentA updated: ${newContent}`);
        this.notify(`Content updated: ${newContent}`);
    }
}

// Observer の具体実装
class Dashboard implements Observer {
    update(message: string): void {
        console.log(`Dashboard received: ${message}`);
    }
}

class NotificationSystem implements Observer {
    update(message: string): void {
        console.log(`NotificationSystem received: ${message}`);
    }
}

const content = new ContentA();
const dashboard = new Dashboard();
const notifyer = new NotificationSystem();

content.attach(dashboard);
content.attach(notifyer);

content.updateContent("New lesson updated!");
