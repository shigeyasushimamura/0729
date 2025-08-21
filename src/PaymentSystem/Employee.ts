import { TimeCard } from "./AddEmployee.ts";

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
export class HourlyClassification extends PaymentClassification {
    private timeCardList: TimeCard[] = new Array<TimeCard>();
    constructor(timeCardList?: TimeCard[]) {
        super();
        this.timeCardList = timeCardList;
    }
    getTimeCard() {
        return this.timeCardList;
    }
    setTimeCard(timeCard: TimeCard) {
        this.timeCardList.push(timeCard);
    }
}

export class PaymentMethod {}
export class HoldMethod extends PaymentMethod {}

export class PayementSchedule {
}

export class MonthlySchedule extends PayementSchedule {
}

export class BiweekSchedule extends PayementSchedule {
}

// factory
export class EmployeeFactory {
    static createSalariedEmployee(empId: number, name: string): Employee {
        const employee = new Employee(empId, name);
        employee.setClassification(new SalariedClassification());
        employee.setSchedule(new MonthlySchedule());
        employee.setPayemntMethod(new HoldMethod());
        return employee;
    }

    static createHourlyEmployee(
        empId: number,
        name: string,
        timeCardList?: TimeCard[],
    ): Employee {
        const employee = new Employee(empId, name);
        employee.setClassification(new HourlyClassification(timeCardList));
        employee.setSchedule(new BiweekSchedule());
        employee.setPayemntMethod(new HoldMethod());
        return employee;
    }
}
