interface Command {
    execute(): void;
}

class Crush implements Command {
    execute(): void {
        console.log("crush");
    }
}

class CompositeCommnad implements Command {
    private commands = new Array<Command>();

    constructor() {
    }

    add(c: Command) {
        this.commands.push(c);
    }

    delete(command: Command) {
        this.commands = this.commands.filter((e) => e !== command);
    }

    get() {
        return this.commands;
    }

    execute(): void {
        for (let i = 0; i < this.commands.length; i++) {
            this.commands[i].execute();
        }
    }
}
