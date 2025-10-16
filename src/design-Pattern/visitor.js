var UnixModemConfigurator = /** @class */ (function () {
    function UnixModemConfigurator() {
    }
    UnixModemConfigurator.prototype.visitHayes = function (modem) {
        // Unix-specific configuration for Hayes
        modem.configurationString = "&sl=4&D=3";
        modem.send("AT" + modem.configurationString);
        console.log("Hayes configured for Unix: ".concat(modem.configurationString));
    };
    UnixModemConfigurator.prototype.visitUSRobotics = function (modem) {
        // Unix-specific configuration for USRobotics
        modem.configurationBaudRate = 115200;
        console.log("USRobotics configured for Unix. Baud: ".concat(modem.configurationBaudRate));
    };
    return UnixModemConfigurator;
}());
/**
 * Concrete Visitor 2: WindowsModemConfigurator (Operation 2 - Easily Added)
 */
var WindowsModemConfigurator = /** @class */ (function () {
    function WindowsModemConfigurator() {
    }
    WindowsModemConfigurator.prototype.visitHayes = function (modem) {
        // Windows-specific configuration for Hayes
        modem.configurationString = "W2";
        modem.send("AT" + modem.configurationString);
        console.log("Hayes configured for Windows: ".concat(modem.configurationString));
    };
    WindowsModemConfigurator.prototype.visitUSRobotics = function (modem) {
        // Windows-specific configuration for USRobotics
        modem.configurationBaudRate = 57600;
        console.log("USRobotics configured for Windows. Baud: ".concat(modem.configurationBaudRate));
    };
    return WindowsModemConfigurator;
}());
var HayesModem = /** @class */ (function () {
    function HayesModem() {
        this.configurationString = null;
    }
    HayesModem.prototype.dial = function (pno) { };
    HayesModem.prototype.hang = function () { };
    HayesModem.prototype.send = function (c) {
        console.log("Hayes: Send -> ".concat(c));
    };
    HayesModem.prototype.recv = function () {
        return "hayes recved";
    };
    // CRITICAL: It calls the specific 'visitHayes' method on the visitor,
    // passing itself (`this`). This is the first dispatch.
    HayesModem.prototype.accept = function (v) {
        v.visitHayes(this);
    };
    return HayesModem;
}());
var USRoboticsModem = /** @class */ (function () {
    function USRoboticsModem() {
        this.configurationBaudRate = 0;
    }
    USRoboticsModem.prototype.dial = function (pno) { };
    USRoboticsModem.prototype.hang = function () { };
    USRoboticsModem.prototype.send = function (c) {
        console.log("USR: Send -> ".concat(c));
    };
    USRoboticsModem.prototype.recv = function () {
        return "usr recved";
    };
    // CRITICAL: It calls the specific 'visitUSRobotics' method on the visitor.
    USRoboticsModem.prototype.accept = function (v) {
        v.visitUSRobotics(this);
    };
    return USRoboticsModem;
}());
console.log("--- Running Visitor Pattern Demo ---");
// 1. Create the Elements (Modems)
var hayes = new HayesModem();
var usr = new USRoboticsModem();
var allModems = [hayes, usr];
// 2. Create the Visitors (Configuration logic)
var unixConfig = new UnixModemConfigurator();
var windowsConfig = new WindowsModemConfigurator();
console.log("\n*** Applying Unix Configuration (Visitor 1) ***");
allModems.forEach(function (modem) {
    // The modem's type determines which 'visit' method is called.
    modem.accept(unixConfig);
});
console.log("\n*** Applying Windows Configuration (Visitor 2) ***");
allModems.forEach(function (modem) {
    // We can swap the operation (Visitor) without touching the Modem classes.
    modem.accept(windowsConfig);
});
