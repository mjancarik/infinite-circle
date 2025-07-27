// biome-ignore-all lint/suspicious/noGlobalAssign: reason
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { toMock } from 'to-mock';
import Infinite from '../Infinite.mjs';

describe('Infinite', () => {
  let infinite;

  const NativeDate = globalThis.Date;
  const MockedDate = toMock(Date);

  const nativeSetTimeout = globalThis.setTimeout;
  const nativeClearTimeout = globalThis.clearTimeout;

  beforeEach(() => {
    infinite = new Infinite();
    Date = MockedDate;
    setTimeout = mock.fn();
    clearTimeout = mock.fn();
  });

  afterEach(() => {
    Date = NativeDate;
    setTimeout = nativeSetTimeout;
    clearTimeout = nativeClearTimeout;
  });

  it('should not suspend execution when next execution time is now', () => {
    // preparing
    infinite._nextExecutionTime = 1;
    infinite._execute = mock.fn();

    // action
    infinite._suspendExecution();

    // assert
    assert.strictEqual(infinite._execute.mock.calls.length, 0);
  });

  it('should suspend execution when next execution time is not now and requestAnimationFrame is defined', () => {
    // preparing
    const requestAnimationFrame = mock.fn();
    Date.now = () => 1;
    infinite._nextExecutionTime = 2;
    infinite._requestAnimationFrame = () => requestAnimationFrame;

    // action
    infinite._suspendExecution();

    // assert
    assert.strictEqual(requestAnimationFrame.mock.callCount(), 1);
    assert.strictEqual(
      typeof requestAnimationFrame.mock.calls[0].arguments[0],
      'function',
    );
  });

  it('should suspend execution when next execution time is not now and setTimeout is called', () => {
    // preparing
    Date.now = () => 1;
    infinite._nextExecutionTime = 2;
    infinite._requestAnimationFrame = mock.fn();

    // action
    infinite._suspendExecution();

    // assert
    assert.strictEqual(setTimeout.mock.callCount(), 1);
    assert.strictEqual(
      typeof setTimeout.mock.calls[0].arguments[0],
      'function',
    );
    assert.strictEqual(typeof setTimeout.mock.calls[0].arguments[1], 'number');
  });
});
