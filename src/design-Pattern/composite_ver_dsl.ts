// DSL的に書く場合
// DSL(Domain Specific Language)ドメイン特化言語。特定の目的に特化した書き方
// e.g. 配列操作のメソッドチェーンも一種のDSL
// const result = [1,2,3,4].filter(x=>x%2===0).map(x=>x*2).reduce((a,b)=> a+b,0)s

interface Command {
    execute(): void;
}

class Crush implements Command {
    execute(): void {
        console.log("crush");
    }
}

class CompositeCommand implements Command {
    private commands: Command[] = [];

    constructor() {}

    // add は this を返す → メソッドチェーン可能
    add(c: Command): this {
        this.commands.push(c);
        return this;
    }

    // remove に変更（delete は予約語）
    remove(c: Command): this {
        this.commands = this.commands.filter((e) => e !== c);
        return this;
    }

    // 子コマンドを取得したい場合
    get(): Command[] {
        return this.commands;
    }

    // execute も this を返すとさらにチェーン可能（任意）
    execute(): this {
        for (const cmd of this.commands) {
            cmd.execute();
        }
        return this;
    }
}
