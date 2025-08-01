"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const add_ts_1 = require("./add.ts");
(0, vitest_1.describe)("add", () => {
    (0, vitest_1.it)("add 2 numbers", () => {
        (0, vitest_1.expect)((0, add_ts_1.add)(1, 2)).toBe(3);
    });
});
