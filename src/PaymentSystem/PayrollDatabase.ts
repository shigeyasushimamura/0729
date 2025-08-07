import { Employee } from "./Employee.ts";

export interface EmployeeService {
    addEmployee(empId: number, employee: Employee): void;
    getEmployee(empId: number): Employee | null;
}

export class DefaultEmployeeService implements EmployeeService {
    constructor(private repository: EmployeeRepository) {
    }

    addEmployee(empId: number, employee: Employee): void {
        this.repository.addEmployee(empId, employee);
    }
    getEmployee(empId: number): Employee | null {
        return this.repository.getEmployee(empId);
    }
}

export interface EmployeeRepository {
    addEmployee(empId: number, employee: Employee): void;
    getEmployee(empId: number): Employee | undefined;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
    private static employees = new Map<number, Employee>();

    addEmployee(empId: number, employee: Employee): void {
        InMemoryEmployeeRepository.employees.set(empId, employee);
    }

    getEmployee(empId: number): Employee | undefined {
        return InMemoryEmployeeRepository.employees.get(empId);
    }
}
