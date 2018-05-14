export default class Infinite {
  constructor() {
    this._circles = new Map();

    this._scheduledCircles = new Map();

    this._executionInterval = 30;
    this._nextExecutionTime = 0;
    this._isSuspendedExecution = false;

    this._suspendExecutionWithContext = this._suspendExecution.bind(this);
  }

  add(circle) {
    this._circles.set(circle.id, circle);

    circle.subscribe((...rest) => this._onChange(circle, ...rest));
  }

  remove(circle) {
    this._circles.delete(circle.id);
  }

  _onChange(circle, ...args) {
    this._scheduledCircles.set(circle.id, { circle, args });

    if (!this._nextExecutionTime) {
      this._nextExecutionTime = Date.now() + this._executionInterval;
    }

    if (!this._isSuspendedExecution) {
      this._suspendExecution();
    }
  }

  _execute(circles) {
    const iterators = circles.map(({ circle, args }) =>
      circle.execute(...args)
    );
    let isEnded = false;

    while (isEnded) {
      isEnded = iterators.reduce(
        (end, iterator) => end && iterator.next().done,
        true
      );
    }
  }

  _suspendExecution() {
    if (
      this._nextExecutionTime <= Date.now() ||
      !this._requstAnimationFrame()
    ) {
      this._nextExecutionTime = 0;

      let copyOfScheduledCircles = this._scheduledCircles.values();
      this._scheduledCircles = new Map();

      this._execute(Array.from(copyOfScheduledCircles));
      this._isSuspendedExecution = false;
    } else {
      this._isSuspendedExecution = true;
      this._requstAnimationFrame()(this._suspendExecutionWithContext);
    }
  }

  _requstAnimationFrame() {
    return typeof window !== undefined && window.requestAnimationFrame;
  }
}
