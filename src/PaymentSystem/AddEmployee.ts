import { Employee } from "./Employee.ts";
import { EmployeeRepository, EmployeeService } from "./PayrollDatabase.ts";

interface Transaction {
    execute(): void;
}

class AddEmployeeTransaction implements Transaction {
    constructor(
        public empId: number,
        private employee: Employee,
        private employeeService: EmployeeService,
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
        super.execute();
    }
}
