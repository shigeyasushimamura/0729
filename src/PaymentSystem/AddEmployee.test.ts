import { describe, expect, it } from "vitest";
import { AddSalariedEmployee } from "./AddEmployee.ts";
import {
    DefaultEmployeeService,
    InMemoryEmployeeRepository,
} from "./PayrollDatabase.ts";
import {
    Employee,
    HoldMethod,
    MonthlySchedule,
    SalariedClassification,
} from "./Employee.ts";

describe("test add employee", () => {
    it("test add salaried employee", () => {
        const repository = new InMemoryEmployeeRepository();
        const employeeService = new DefaultEmployeeService(repository);
        const empId = 1;
        const employee = new Employee(empId, "Bob");

        const tx = new AddSalariedEmployee(empId, employee, employeeService);
        tx.execute();

        const emp = employeeService.getEmployee(empId);
        expect(emp).not.toBeUndefined();
        expect(emp.getEmpId()).toBe(empId);
        expect(emp.getName()).toBe("Bob");

        const cls = emp.getClassification();
        const payDay = emp.getSchedule();
        const payMethod = emp.getPayMethod();

        expect(cls).toBeInstanceOf(SalariedClassification);
        expect(payDay).toBeInstanceOf(MonthlySchedule);
        expect(payMethod).toBeInstanceOf(HoldMethod);
    });
});
