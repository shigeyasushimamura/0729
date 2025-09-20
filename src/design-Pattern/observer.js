// Subject の具体実装
var ContentA = /** @class */ (function () {
    function ContentA() {
        this.observers = [];
    }
    ContentA.prototype.attach = function (observer) {
        this.observers.push(observer);
    };
    ContentA.prototype.detach = function (observer) {
        this.observers = this.observers.filter(function (obs) { return obs !== observer; });
    };
    ContentA.prototype.notify = function (message) {
        // 同期処理で順番に通知
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            observer.update(message);
        }
    };
    // コンテンツ更新などのトリガー
    ContentA.prototype.updateContent = function (newContent) {
        console.log("ContentA updated: ".concat(newContent));
        this.notify("Content updated: ".concat(newContent));
    };
    return ContentA;
}());
// Observer の具体実装
var Dashboard = /** @class */ (function () {
    function Dashboard() {
    }
    Dashboard.prototype.update = function (message) {
        console.log("Dashboard received: ".concat(message));
    };
    return Dashboard;
}());
var NotificationSystem = /** @class */ (function () {
    function NotificationSystem() {
    }
    NotificationSystem.prototype.update = function (message) {
        console.log("NotificationSystem received: ".concat(message));
    };
    return NotificationSystem;
}());
var content = new ContentA();
var dashboard = new Dashboard();
var notifyer = new NotificationSystem();
content.attach(dashboard);
content.attach(notifyer);
content.updateContent("New lesson updated!");
