import {
    BiweekSchedule,
    Employee,
    EmployeeFactory,
    HoldMethod,
    HourlyClassification,
    MonthlySchedule,
    SalariedClassification,
} from "./Employee.ts";
import { EmployeeService } from "./PayrollDatabase.ts";

interface Transaction {
    execute(): void;
}

export class DeleteEmployeeTransaction implements Transaction {
    constructor(protected empId: number, protected employeeService) {
    }

    execute(): void {
        this.employeeService.deleteEmployee(this.empId);
    }
}

abstract class AddEmployeeTransaction implements Transaction {
    constructor(
        protected empId: number,
        protected name: string,
        protected employeeService: EmployeeService,
    ) {
    }

    abstract execute(): void;
}

export class AddSalariedEmployee extends AddEmployeeTransaction {
    constructor(
        empId: number,
        name: string,
        employeeService: EmployeeService,
    ) {
        super(empId, name, employeeService);
    }

    execute(): void {
        const emp = EmployeeFactory.createSalariedEmployee(
            this.empId,
            this.name,
        );
        this.employeeService.addEmployee(this.empId, emp);
    }
}

export class AddHourlyEmployee extends AddEmployeeTransaction {
    constructor(
        empId: number,
        name: string,
        employeeService: EmployeeService,
        private timeCardList?: TimeCard[],
    ) {
        super(empId, name, employeeService);
    }

    execute(): void {
        const emp = EmployeeFactory.createHourlyEmployee(
            this.empId,
            this.name,
            this.timeCardList,
        );
        this.employeeService.addEmployee(this.empId, emp);
    }
}

export class TimeCard {
    constructor(public id: number, public hour: number, public date: string) {}
}
