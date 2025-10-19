interface Modem {
  dial(pno: string): void;
  hang(): void;
  send(c: string): void;
  recv(): string;
  accept(v: ModemVisitor): void;
}

interface ModemVisitor {
  // Methods for each concrete Element type
  visitHayes(m: HayesModem): void;
  visitUSRobotics(m: USRoboticsModem): void;
}

class UnixModemConfigurator implements ModemVisitor {
  visitHayes(modem: HayesModem) {
    // Unix-specific configuration for Hayes
    modem.configurationString = "&sl=4&D=3";
    modem.send("AT" + modem.configurationString);
    console.log(`Hayes configured for Unix: ${modem.configurationString}`);
  }

  visitUSRobotics(modem: USRoboticsModem) {
    // Unix-specific configuration for USRobotics
    modem.configurationBaudRate = 115200;
    console.log(
      `USRobotics configured for Unix. Baud: ${modem.configurationBaudRate}`
    );
  }
}

/**
 * Concrete Visitor 2: WindowsModemConfigurator (Operation 2 - Easily Added)
 */
class WindowsModemConfigurator implements ModemVisitor {
  visitHayes(modem: HayesModem) {
    // Windows-specific configuration for Hayes
    modem.configurationString = "W2";
    modem.send("AT" + modem.configurationString);
    console.log(`Hayes configured for Windows: ${modem.configurationString}`);
  }

  visitUSRobotics(modem: USRoboticsModem) {
    // Windows-specific configuration for USRobotics
    modem.configurationBaudRate = 57600;
    console.log(
      `USRobotics configured for Windows. Baud: ${modem.configurationBaudRate}`
    );
  }
}

class HayesModem implements Modem {
  public configurationString: string | null = null;
  dial(pno: string): void {}
  hang(): void {}
  send(c: string): void {
    console.log(`Hayes: Send -> ${c}`);
  }
  recv(): string {
    return "hayes recved";
  }

  // CRITICAL: It calls the specific 'visitHayes' method on the visitor,
  // passing itself (`this`). This is the first dispatch.
  accept(v: ModemVisitor): void {
    v.visitHayes(this);
  }
}

class USRoboticsModem implements Modem {
  public configurationBaudRate: number = 0;
  dial(pno: string): void {}
  hang(): void {}
  send(c: string): void {
    console.log(`USR: Send -> ${c}`);
  }
  recv(): string {
    return "usr recved";
  }

  // CRITICAL: It calls the specific 'visitUSRobotics' method on the visitor.
  accept(v: ModemVisitor): void {
    v.visitUSRobotics(this);
  }
}

console.log("--- Running Visitor Pattern Demo ---");

// 1. Create the Elements (Modems)
const hayes = new HayesModem();
const usr = new USRoboticsModem();
const allModems: Modem[] = [hayes, usr];

// 2. Create the Visitors (Configuration logic)
const unixConfig = new UnixModemConfigurator();
const windowsConfig = new WindowsModemConfigurator();

console.log("\n*** Applying Unix Configuration (Visitor 1) ***");
allModems.forEach((modem) => {
  // The modem's type determines which 'visit' method is called.
  modem.accept(unixConfig);
});

console.log("\n*** Applying Windows Configuration (Visitor 2) ***");
allModems.forEach((modem) => {
  // We can swap the operation (Visitor) without touching the Modem classes.
  modem.accept(windowsConfig);
});
