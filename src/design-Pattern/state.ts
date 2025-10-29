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

export class Turnstile {
  state: State;

  constructor(private controller: TurnstileController) {
    this.state = State.Locked;
  }

  event(event: Event): void {
    switch (this.state) {
      case State.Locked:
        if (event === Event.Coin) {
          this.state = State.Unlocked;
          this.controller.unlock();
        } else if (event === Event.Pass) {
          this.controller.alarm();
        }
        break;
      case State.Unlocked:
        if (event === Event.Pass) {
          this.state = State.Locked;
          this.controller.lock();
        } else if (event == Event.Coin) {
          this.controller.thankyou();
        }

        break;
    }
  }
}
