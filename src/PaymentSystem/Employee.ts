export class Employee {
    paymentClassification: PaymentClassification | undefined;
    paymentMethod: PaymentMethod | undefined;
    paymentSchedule: PaymentMethod | undefined;

    constructor(private empId: number, private name: string) {
    }

    getEmpId() {
        return this.empId;
    }

    getName() {
        return this.name;
    }

    public setClassification(classification: PaymentClassification) {
        this.paymentClassification = classification;
    }

    getClassification() {
        return this.paymentClassification;
    }

    setSchedule(schedule: PayementSchedule) {
        this.paymentSchedule = schedule;
    }

    getSchedule() {
        return this.paymentSchedule;
    }

    setPayemntMethod(method: PaymentMethod) {
        this.paymentMethod = method;
    }

    getPayMethod() {
        return this.paymentMethod;
    }
}

export class PaymentClassification {
}
export class SalariedClassification extends PaymentClassification {
}

export class PaymentMethod {}
export class HoldMethod {}

export class PayementSchedule {
}

export class MonthlySchedule extends PayementSchedule {
}
