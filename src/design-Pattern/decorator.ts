// Decorator::重ね着パターン

interface Component {
  operation(): string;
}

class ConcreteComponent implements Component {
  operation(): string {
    return "Base";
  }
}

class DecoratorA implements Component {
  constructor(private component: Component) {}
  operation(): string {
    return this.component.operation() + "+A";
  }
}

class DecoratorB implements Component {
  constructor(private component: Component) {}
  operation(): string {
    return this.component.operation() + "+B";
  }
}

class DecoratorC implements Component {
  constructor(private component: Component) {}
  operation(): string {
    return this.component.operation() + "+C";
  }
}

// 使い方：動的に機能を積み重ねる
let obj: Component = new ConcreteComponent();
obj = new DecoratorA(obj); // "Base + A"

console.log(obj.operation());

obj = new DecoratorB(obj); // "Base + A + B"

console.log(obj.operation());

obj = new DecoratorC(obj); // "Base + A + B + C"

console.log(obj.operation());

// Visitor
// solidなドメインに対して追加操作する
// オブジェクト構造を「訪問」して操作を適用
// class Order {
//   accept<T>(visitor: Visitor<T>): T {
//     return visitor.visitOrder(this);
//   }
// }

// interface Visitor<T> {
//   visitOrder(order: Order): T;
//   visitProduct(product: Product): T;
// }

// // 使い方：外部から異なる操作を注入
// const validator = new ValidationVisitor();
// order.accept(validator);  // ValidationError[]

// const pricer = new PriceVisitor();
// order.accept(pricer);     // PriceBreakdown

// Acyclic Visitor パターン
// 循環依存を解消したVisitor
// interface Visitor {} // 空のマーカー

// interface OrderVisitor<T> extends Visitor {
//   visitOrder(order: Order): T;
// }

// class Order {
//   accept<T>(visitor: Visitor): T {
//     if (this.isOrderVisitor(visitor)) {
//       return visitor.visitOrder(this);
//     }
//     throw new Error("Not supported");
//   }
// }

// // 必要な型だけ実装
// class OrderOnlyValidator implements OrderVisitor<Error[]> {
//   visitOrder(order: Order): Error[] { /*...*/ }
//   // visitProductは実装不要
// }

// Tagged Union パターン
// 判別可能な共用型で型安全に処理
// type Entity =
//   | { type: "order"; data: Order }
//   | { type: "product"; data: Product }
//   | { type: "customer"; data: Customer };

// function validate(entity: Entity): ValidationError[] {
//   switch (entity.type) {
//     case "order":
//       return validateOrder(entity.data);
//     case "product":
//       return validateProduct(entity.data);
//     case "customer":
//       return validateCustomer(entity.data);
//     // TypeScriptが網羅性をチェック
//   }
// }

// // あなたのまとめ
// 「あまりVisitorに対するメリットが高くないとき」

// // → 具体的には？
// // - 型が増える？
// // - 操作が少ない？
// // - ネストがない？
// // - チームが小規模？
// ```

// ### 満点にする改善案
// ```
// 共通基盤系（バリデーション・ログ・認証）→ Visitor
// 機能の重ね着で合体する一つのもの → Decorator

// Tagged Union = 単純なswitch分岐
// → 型が頻繁に増える & 操作が固定的なときの「つなぎ」
// → それ以外はVisitorの劣化版
// ```

// または
// ```
// 共通基盤系 → Visitor
//   理由: 操作が増える、階層構造、型安全性

// 機能の重ね着 → Decorator
//   理由: 動的な振る舞い追加、同一インターフェース維持

// Tagged Union → switch分岐
//   使い所: 型が増える・操作が固定・フラット構造
//   それ以外: Visitorを使うべき
