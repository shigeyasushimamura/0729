import {
    Employee,
    HoldMethod,
    MonthlySchedule,
    SalariedClassification,
} from "./Employee.ts";
import { EmployeeService } from "./PayrollDatabase.ts";

interface Transaction {
    execute(): void;
}

class AddEmployeeTransaction implements Transaction {
    constructor(
        protected empId: number,
        protected employee: Employee,
        protected employeeService: EmployeeService,
    ) {
    }

    execute(): void {
        this.employeeService.addEmployee(this.empId, this.employee);
    }
}

export class AddSalariedEmployee extends AddEmployeeTransaction {
    constructor(
        empId: number,
        employee: Employee,
        employeeService: EmployeeService,
    ) {
        super(empId, employee, employeeService);
    }

    execute(): void {
        this.employee.setClassification(new SalariedClassification());
        this.employee.setSchedule(new MonthlySchedule());
        this.employee.setPayemntMethod(new HoldMethod());
        super.execute();
    }
}
