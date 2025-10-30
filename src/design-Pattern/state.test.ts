import { describe, expect, it, beforeEach } from "vitest";
import { Turnstile, State, Event, TurnstileController } from "./state";

describe("Turnstile", () => {
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

  // 基本的な状態遷移
  describe("state transitions", () => {
    const stateTransitionTestCases = [
      {
        name: "should unlock when coin is inserted while locked",
        initialState: State.Locked,
        event: Event.Coin,
        expectedState: State.Unlocked,
        expectedAction: "unlock" as const,
      },
      {
        name: "should trigger alarm when attempting to pass while locked",
        initialState: State.Locked,
        event: Event.Pass,
        expectedState: State.Locked,
        expectedAction: "alarm" as const,
      },
      {
        name: "should thank user when coin is inserted while unlocked",
        initialState: State.Unlocked,
        event: Event.Coin,
        expectedState: State.Unlocked,
        expectedAction: "thankyou" as const,
      },
      {
        name: "should lock when user passes through while unlocked",
        initialState: State.Unlocked,
        event: Event.Pass,
        expectedState: State.Locked,
        expectedAction: "lock" as const,
      },
    ];

    it.each(stateTransitionTestCases)(
      "$name",
      ({ initialState, event, expectedState, expectedAction }) => {
        // Arrange
        turnstile.setState(initialState);

        // Act
        const result = turnstile.event(event);

        // Assert
        expect(turnstile.state).toBe(expectedState);
        expect(result.previousState).toBe(initialState);
        expect(result.currentState).toBe(expectedState);
        expect(result.actionTaken).toBe(expectedAction);
        expect(controller[`${expectedAction}Called`]).toBe(true);
      }
    );
  });
});
