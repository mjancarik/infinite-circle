import uuid from './uuid';

export default class Circle {
  constructor({ listen, unlisten, filter, execute } = {}) {
    this.id = uuid();

    this._listen = listen || (() => {});
    this._unlisten = unlisten || (() => {});
    this._filter = filter || this._defaultFilter;
    this._execute = execute || ((...args) => this._defaultExecute(...args));

    this._entries = new Map();
    this._lockCircle = false;

    this._observers = [];

    this._notifyWithContext = this.notify.bind(this);
  }

  subscribe(listener) {
    this._observers.push(listener);
  }

  notify(...args) {
    this._observers.map(listener => {
      listener(...args);
    });
  }

  getEntries() {
    return this._entries;
  }

  register({ read, write, meta = { interval: 180 } }) {
    let id = uuid();

    this._entries.set(id, {
      read,
      write,
      meta,
      time: Date.now() - meta.interval - 1,
      args: []
    });

    if (this._entries.size === 1) {
      this._listen(this._notifyWithContext);
    }

    return id;
  }

  unregister(id) {
    this._entries.delete(id);

    if (this._entries.size === 0) {
      this._unlisten(this._notifyWithContext);
    }
  }

  filter(circleEntries, ...args) {
    return this._filter(circleEntries, ...args);
  }

  read(circleEntries, ...args) {
    const now = Date.now();

    return circleEntries.map(entry => {
      entry.time = now;
      entry.args = args;
      let payload =
        typeof entry.read === 'function' ? entry.read(...args) : null;

      return Object.assign({ payload }, entry);
    });
  }

  write(circleEntries, ...args) {
    return circleEntries.map(entry => {
      if (typeof entry.write === 'function') {
        entry.write(entry, ...args);
      }
    });
  }

  *execute(...args) {
    if (this._lockCircle || this._entries.size === 0) {
      return [];
    }

    this._lockCircle = true;
    let modifiedEntries = yield* this._execute(...args);
    this._lockCircle = false;

    let isCallAllEntriesWithArgs = !!Array.from(this._entries.values()).filter(
      entry => entry.args !== args
    ).length;

    if (!isCallAllEntriesWithArgs) {
      this.notify(...args);
    }

    return modifiedEntries;
  }

  _defaultFilter(circleEntries) {
    // if (args.length === 0 ) {
    //     return [];
    // }

    const now = Date.now();

    return Array.from(circleEntries.values()).filter(loopEntry => {
      return loopEntry.time + loopEntry.meta.interval <= now;
    });
  }

  *_defaultExecute(...args) {
    let circleEntries = this.getEntries();

    circleEntries = this.filter(circleEntries, ...args);
    circleEntries = (yield circleEntries) || circleEntries;
    circleEntries = this.read(circleEntries, ...args);
    circleEntries = (yield circleEntries) || circleEntries;
    circleEntries = this.write(circleEntries, ...args);

    return circleEntries;
  }
}
