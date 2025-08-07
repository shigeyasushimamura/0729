import { describe, expect, it } from "vitest";
import {
    AddHourlyEmployee,
    AddSalariedEmployee,
    TimeCard,
} from "./AddEmployee.ts";
import {
    DefaultEmployeeService,
    InMemoryEmployeeRepository,
} from "./PayrollDatabase.ts";
import {
    BiweekSchedule,
    Employee,
    HoldMethod,
    HourlyClassification,
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

    it("test add hourly employee", () => {
        const repository = new InMemoryEmployeeRepository();
        const employeeService = new DefaultEmployeeService(repository);
        const empId = 2;
        const employee = new Employee(empId, "Bob");

        const timeCardList = new Array<TimeCard>();
        const t1 = new TimeCard(1, 8, "2025-01-01");
        timeCardList.push(t1);

        const tx = new AddHourlyEmployee(
            empId,
            employee,
            employeeService,
            timeCardList,
        );
        tx.execute();

        const emp = employeeService.getEmployee(empId);
        expect(emp).not.toBeUndefined();
        expect(emp.getEmpId()).toBe(empId);
        expect(emp.getName()).toBe("Bob");

        const cls = emp.getClassification();
        const payDay = emp.getSchedule();
        const payMethod = emp.getPayMethod();

        expect(cls).toBeInstanceOf(HourlyClassification);
        const hourlyCls = cls as HourlyClassification;
        expect(hourlyCls.getTimeCard()).toEqual(timeCardList);
        expect(payDay).toBeInstanceOf(BiweekSchedule);
        expect(payMethod).toBeInstanceOf(HoldMethod);
    });
});
