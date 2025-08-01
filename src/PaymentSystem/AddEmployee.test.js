"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const AddEmployee_ts_1 = require("./AddEmployee.ts");
const PayrollDatabase_ts_1 = require("./PayrollDatabase.ts");
(0, vitest_1.describe)("test add employee", () => {
    (0, vitest_1.it)("test add salaried employee", () => {
        const repository = new PayrollDatabase_ts_1.InMemoryEmployeeRepository();
        const empId = 1;
        const employee = new AddEmployee_ts_1.AddSalariedEmployee(1, repository);
        employee.execute();
        const data = PayrollDatabase_ts_1.PayrollDatabase.GetEmployee(empId);
    });
});
