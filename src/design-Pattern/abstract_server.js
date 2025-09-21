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
var AssignmentServer = /** @class */ (function () {
    function AssignmentServer() {
        this.clients = [];
    }
    AssignmentServer.prototype.attach = function (client) {
        this.clients.push(client);
    };
    AssignmentServer.prototype.detach = function (client) {
        this.clients.filter(function (c) { return c !== client; });
    };
    return AssignmentServer;
}());
// 具象サーバ
var MathAssignmentServer = /** @class */ (function (_super) {
    __extends(MathAssignmentServer, _super);
    function MathAssignmentServer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MathAssignmentServer.prototype.distributeAssignment = function (title) {
        console.log("Distributing assignment: ".concat(title));
        this.clients.forEach(function (c) { return c.receiveAssignment(title); });
    };
    return MathAssignmentServer;
}(AssignmentServer));
// 具象クライアント
var AliceClient = /** @class */ (function () {
    function AliceClient() {
    }
    AliceClient.prototype.receiveAssignment = function (title) {
        console.log("Alice received assignment ".concat(title));
    };
    return AliceClient;
}());
var server = new MathAssignmentServer();
var alice = new AliceClient();
server.attach(alice);
server.distributeAssignment("Linear algebra homework");
