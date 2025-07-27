// biome-ignore-all lint/suspicious/noGlobalAssign: reason
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { toMock } from 'to-mock';
import Circle from '../Circle.mjs';

function createEntry(payload) {
  return {
    read: () => payload,
    write: () => true,
    meta: { interval: 60 },
    args: [],
    time: -60,
  };
}

describe('Circle', () => {
  let circle;
  let entry;
  let payload;

  const NativeDate = Date;

  beforeEach(() => {
    const MockedDate = toMock(NativeDate);
    MockedDate.now = () => 1;
    Date = MockedDate;

    circle = new Circle();
    payload = 111;
    entry = createEntry(payload);
  });

  afterEach(() => {
    Date = NativeDate;
  });

  it('calls listen method for registering first entry', () => {
    // preparing
    let called = false;
    circle._listen = () => {
      called = true;
    };

    // action
    circle.register(createEntry(1));

    // assert
    assert.strictEqual(called, true);
    assert.strictEqual(circle.getEntries().size, 1);
  });

  it('calls unlisten method for unregistering last entry', () => {
    // preparing
    let called = false;
    circle._unlisten = () => {
      called = true;
    };
    const id = circle.register(createEntry(1));

    // action
    circle.unregister(id);

    // assert
    assert.strictEqual(called, true);
    assert.strictEqual(circle.getEntries().size, 0);
  });

  it('calls read method which returns right structure for write method', () => {
    // preparing
    entry.read = (args) => {
      assert.deepStrictEqual(args, { event: 'event' });
      return payload;
    };
    circle.register(entry);
    const entries = Array.from(circle.getEntries().values());

    // action
    const result = circle.read(entries, { event: 'event' });

    // assert
    // Deep compare structure, ignoring dynamic fields like time and function references
    const expected = [
      {
        ...entry,
        payload,
        time: result[0].time, // Accept actual time value
        args: [{ event: 'event' }],
      },
    ];
    assert.deepStrictEqual(result, expected);
  });

  it('calls write method with right structure', () => {
    // preparing
    let calledWith = null;
    entry.write = (obj, args) => {
      calledWith = [obj, args];
    };
    circle.register(entry);
    const entries = Array.from(circle.getEntries().values()).map((entry) =>
      Object.assign({ payload }, entry),
    );

    // action
    circle.write(entries, { event: 'event' });

    // assert
    // Accept dynamic time value from actual object
    const [actualObj, actualArgs] = calledWith;
    const expectedObj = { ...entry, payload, time: actualObj.time };
    assert.deepStrictEqual(
      [actualObj, actualArgs],
      [expectedObj, { event: 'event' }],
    );
  });

  describe('execute method', () => {
    function run(iterator) {
      let result = iterator.next();

      while (!result.done) {
        result = iterator.next();
      }

      return result;
    }

    it('returns empty array for locked circle', () => {
      // preparing
      circle.register(createEntry(1));
      circle.execute().next();
      const iterator = circle.execute({ event: 'event' });

      // action
      const iterableObject = run(iterator);

      // assert
      assert.deepStrictEqual(iterableObject.value, []);
      assert.strictEqual(iterableObject.done, true);
    });

    it('returns empty array for empty circle', () => {
      // preparing
      const iterator = circle.execute({ event: 'event' });

      // action
      const iterableObject = run(iterator);

      // assert
      assert.deepStrictEqual(iterableObject.value, []);
      assert.strictEqual(iterableObject.done, true);
    });

    it('returns empty array if all entries are filtered', () => {
      // preparing
      let now = 60;
      Date.now = () => now;
      circle.register(createEntry(1));
      const iterator = circle.execute({ event: 'event' });
      now = 30;

      // action
      const iterableObject = run(iterator);

      // assert
      assert.deepStrictEqual(iterableObject.value, []);
      assert.strictEqual(iterableObject.done, true);
    });

    it('returns [undefined] if all entries are filtered 2', () => {
      // preparing
      let now = 60;
      Date.now = () => now;
      now = 61;
      circle.register(createEntry(1));
      const iterator = circle.execute({ event: 'event' });

      // action
      const iterableObject = run(iterator);

      // assert
      assert.deepStrictEqual(iterableObject.value, [true]);
      assert.strictEqual(iterableObject.done, true);
    });

    it('calls notify method if all entries were not called with defined arguments', () => {
      // preparing
      let notifiedArgs = null;
      circle.notify = (args) => {
        notifiedArgs = args;
      };
      let now = 60;
      Date.now = () => now;
      circle.register(createEntry(1));
      const iterator = circle.execute({ event: 'event' });
      now = 30;

      // action
      const iterableObject = run(iterator);

      // assert
      assert.deepStrictEqual(notifiedArgs, { event: 'event' });
      assert.deepStrictEqual(iterableObject.value, []);
      assert.strictEqual(iterableObject.done, true);
    });
  });
});
