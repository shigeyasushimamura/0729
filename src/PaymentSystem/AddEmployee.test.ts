import { describe, expect, it } from "vitest";
import { AddSalariedEmployee } from "./AddEmployee.ts";
import {
    DefaultEmployeeService,
    InMemoryEmployeeRepository,
} from "./PayrollDatabase.ts";
import { Employee } from "./Employee.ts";

describe("test add employee", () => {
    it("test add salaried employee", () => {
        const repository = new InMemoryEmployeeRepository();
        const employeeService = new DefaultEmployeeService(repository);
        const empId = 1;
        const employee = new Employee(empId, "Bob");

        const tx = new AddSalariedEmployee(empId, employee, employeeService);

        const data = employeeService.getEmployee(empId);
        expect(data).not.toBeUndefined();
    });
});
