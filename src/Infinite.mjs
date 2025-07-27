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
      circle.execute(...args),
    );
    let isNextStep = true;

    while (isNextStep) {
      isNextStep = !iterators.reduce(
        (end, iterator) => end && iterator.next().done,
        true,
      );
    }
  }

  _suspendExecution() {
    if (this._nextExecutionTime <= Date.now()) {
      this._nextExecutionTime = 0;

      const copyOfScheduledCircles = this._scheduledCircles.values();
      this._scheduledCircles = new Map();

      this._isSuspendedExecution = false;
      this._execute(Array.from(copyOfScheduledCircles));
    } else {
      this._isSuspendedExecution = true;

      if (this._requestAnimationFrame()) {
        this._requestAnimationFrame()(this._suspendExecutionWithContext);
      } else {
        setTimeout(this._suspendExecutionWithContext, 1000 / 60);
      }
    }
  }

  _requestAnimationFrame() {
    return typeof window !== 'undefined' && window.requestAnimationFrame;
  }
}
