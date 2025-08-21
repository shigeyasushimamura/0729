import { describe, expect, it } from "vitest";
import {
    AddHourlyEmployee,
    AddSalariedEmployee,
    AddTImeCardTransaction,
    DeleteEmployeeTransaction,
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
        const name = "Bob";

        const tx = new AddSalariedEmployee(empId, name, employeeService);
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

    it("test add hourly employee and create Timecard", () => {
        const repository = new InMemoryEmployeeRepository();
        const employeeService = new DefaultEmployeeService(repository);
        const empId = 2;
        const name = "Bob";

        const timeCardList = new Array<TimeCard>();
        const t1 = new TimeCard(1, 8, "2025-01-01");
        timeCardList.push(t1);

        const tx = new AddHourlyEmployee(
            empId,
            name,
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

        // test tx timecard
        const addTimecardTransaction = new AddTImeCardTransaction(
            2,
            10,
            "2025-02-02",
            empId,
            employeeService,
        );
        addTimecardTransaction.execute();
        const ele2 = hourlyCls.getTimeCard().at(1);

        expect(ele2.id).toEqual(2);
        expect(ele2.hour).toEqual(10);
        expect(ele2.date).toEqual("2025-02-02");
    });

    it("test delete employee", () => {
        const empId = 1;
        const rep = new InMemoryEmployeeRepository();
        const service = new DefaultEmployeeService(rep);

        const emp1 = service.getEmployee(empId);
        expect(emp1).not.toBeUndefined();

        const tx = new DeleteEmployeeTransaction(empId, service);
        tx.execute();

        const emp2 = service.getEmployee(empId);

        expect(emp2).toBeUndefined();
    });
});
