var ConcreteComponent = /** @class */ (function () {
    function ConcreteComponent() {
    }
    ConcreteComponent.prototype.operation = function () {
        return "Base";
    };
    return ConcreteComponent;
}());
var DecoratorA = /** @class */ (function () {
    function DecoratorA(component) {
        this.component = component;
    }
    DecoratorA.prototype.operation = function () {
        return this.component.operation() + "+A";
    };
    return DecoratorA;
}());
var DecoratorB = /** @class */ (function () {
    function DecoratorB(component) {
        this.component = component;
    }
    DecoratorB.prototype.operation = function () {
        return this.component.operation() + "+B";
    };
    return DecoratorB;
}());
var DecoratorC = /** @class */ (function () {
    function DecoratorC(component) {
        this.component = component;
    }
    DecoratorC.prototype.operation = function () {
        return this.component.operation() + "+C";
    };
    return DecoratorC;
}());
// 使い方：動的に機能を積み重ねる
var obj = new ConcreteComponent();
obj = new DecoratorA(obj); // "Base + A"
console.log(obj.operation());
obj = new DecoratorB(obj); // "Base + A + B"
console.log(obj.operation());
obj = new DecoratorC(obj); // "Base + A + B + C"
console.log(obj.operation());
