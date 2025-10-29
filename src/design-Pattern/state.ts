// state.ts

export enum State {
  Locked,
  Unlocked,
}

export enum Event {
  Coin,
  Pass,
}

export interface TurnstileController {
  unlock(): void;
  lock(): void;
  alarm(): void;
  thankyou(): void;
}

export type EventResult = {
  previousState: State;
  currentState: State;
  actionTaken: "unlock" | "lock" | "alarm" | "thankyou" | "none";
};

export class Turnstile {
  private _state: State;

  constructor(private controller: TurnstileController) {
    this._state = State.Locked;
  }

  get state(): State {
    return this._state;
  }

  // テスト用
  setState(state: State): void {
    this._state = state;
  }

  event(event: Event): EventResult {
    const previousState = this._state;
    let actionTaken: EventResult["actionTaken"] = "none";

    switch (this._state) {
      case State.Locked:
        if (event === Event.Coin) {
          this._state = State.Unlocked;
          this.controller.unlock();
          actionTaken = "unlock";
        } else if (event === Event.Pass) {
          this.controller.alarm();
          actionTaken = "alarm";
        }
        break;
      case State.Unlocked:
        if (event === Event.Pass) {
          this._state = State.Locked;
          this.controller.lock();
          actionTaken = "lock";
        } else if (event === Event.Coin) {
          this.controller.thankyou();
          actionTaken = "thankyou";
        }
        break;
    }

    return {
      previousState,
      currentState: this._state,
      actionTaken,
    };
  }
}
