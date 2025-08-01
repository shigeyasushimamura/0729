import { describe, expect, it } from "vitest";
import { add } from "./add.ts";

describe("add", () => {
    it("add 2 numbers", () => {
        expect(add(1, 2)).toBe(3);
    });
});
