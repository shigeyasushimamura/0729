class OldClient {
    // adapterによってNewModemもつかえるように！
    list: Array<OldModem[]>;
}

interface OldModem {
    dial(): void;
    hang(): void;
    send(): void;
    receive(): void;
}

class OldModemImpA implements OldModem {
    dial(): void {
    }
    hang(): void {
    }
    send(): void {
    }
    receive(): void {
    }
}

class OldModemAdapter implements OldModem {
    constructor(private newModem: NewModem) {
    }

    dial(): void {
        console.log(`zzz...`);
    }
    hang(): void {
        console.log(`zzz...`);
    }
    send(): void {
        this.newModem.send();
    }
    receive(): void {
        this.newModem.receive();
    }
}

interface NewModem {
    send(): void;
    receive();
}

class NewModemImpA implements NewModem {
    send(): void {
    }

    receive() {
    }
}

class NewClient {
    list: Array<NewModem>;
}
