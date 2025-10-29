import { describe, expect, it, beforeEach } from "vitest";
import { Turnstile, State, Event, TurnstileController } from "./state";

describe("turnstile test", () => {
  class MockTurnstileController implements TurnstileController {
    unlockCalled = false;
    lockCalled = false;
    alarmCalled = false;
    thankyouCalled = false;

    unlock(): void {
      this.unlockCalled = true;
    }
    lock(): void {
      this.lockCalled = true;
    }
    alarm(): void {
      this.alarmCalled = true;
    }
    thankyou(): void {
      this.thankyouCalled = true;
    }

    reset(): void {
      this.unlockCalled = false;
      this.lockCalled = false;
      this.alarmCalled = false;
      this.thankyouCalled = false;
    }
  }
  let controller: MockTurnstileController;
  let turnstile: Turnstile;

  beforeEach(() => {
    controller = new MockTurnstileController();
    turnstile = new Turnstile(controller);
  });

  it("Locked + Coin -> Unlocked (unlock呼ばれる)", () => {
    turnstile.state = State.Locked;
    turnstile.event(Event.Coin);

    expect(turnstile.state).toEqual(State.Unlocked);
    expect(controller.unlockCalled).toBe(true);
  });

  it("Locked + Pass -> Locked (alarm呼ばれる)", () => {
    turnstile.state = State.Locked;
    turnstile.event(Event.Pass);

    expect(turnstile.state).toEqual(State.Locked);
    expect(controller.alarmCalled).toBe(true);
  });

  it("Unlocked + Coin -> Unlocked (何も起きない)", () => {
    turnstile.state = State.Unlocked;
    turnstile.event(Event.Coin);

    expect(turnstile.state).toEqual(State.Unlocked);
    expect(controller.thankyouCalled).toBe(true);
  });

  it("Unlocked + Pass -> Locked (lock呼ばれる)", () => {
    turnstile.state = State.Unlocked;
    turnstile.event(Event.Pass);

    expect(turnstile.state).toEqual(State.Locked);
    expect(controller.lockCalled).toBe(true);
  });
});
