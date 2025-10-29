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

  // ✅ データ駆動テスト
  it.each([
    {
      name: "Locked + Coin -> Unlocked (unlock呼ばれる)",
      initialState: State.Locked,
      event: Event.Coin,
      expectedState: State.Unlocked,
      expectedAction: "unlock" as const,
    },
    {
      name: "Locked + Pass -> Locked (alarm呼ばれる)",
      initialState: State.Locked,
      event: Event.Pass,
      expectedState: State.Locked,
      expectedAction: "alarm" as const,
    },
    {
      name: "Unlocked + Coin -> Unlocked (thankyou呼ばれる)",
      initialState: State.Unlocked,
      event: Event.Coin,
      expectedState: State.Unlocked,
      expectedAction: "thankyou" as const,
    },
    {
      name: "Unlocked + Pass -> Locked (lock呼ばれる)",
      initialState: State.Unlocked,
      event: Event.Pass,
      expectedState: State.Locked,
      expectedAction: "lock" as const,
    },
  ])("$name", ({ initialState, event, expectedState, expectedAction }) => {
    // 初期状態設定
    turnstile.setState(initialState);

    // イベント実行
    const result = turnstile.event(event);

    // 状態遷移の確認
    expect(turnstile.state).toBe(expectedState);
    expect(result.previousState).toBe(initialState);
    expect(result.currentState).toBe(expectedState);
    expect(result.actionTaken).toBe(expectedAction);

    // コントローラー呼び出しの確認
    expect(controller[`${expectedAction}Called`]).toBe(true);
  });
});
