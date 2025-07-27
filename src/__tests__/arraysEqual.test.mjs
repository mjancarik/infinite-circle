import assert from 'node:assert';
import { beforeEach, describe, it } from 'node:test';
import arraysEqual from '../arraysEqual.mjs';

describe('arraysEqual', () => {
  let string;
  let object;
  let number;
  let array;
  let sampleArray;
  let equalArray;
  let notEqualArray;

  beforeEach(() => {
    string = 'string';
    object = { property: 'value' };
    number = 1;
    array = ['value'];
    sampleArray = [string, object, number, array];
    equalArray = [string, object, number, array];
    notEqualArray = [string, object, array, number];
  });

  it('returns true for same array', () => {
    // action
    const result = arraysEqual(sampleArray, sampleArray);

    // assert
    assert.strictEqual(result, true);
  });

  it('returns true for equal array', () => {
    // action
    const result = arraysEqual(sampleArray, equalArray);

    // assert
    assert.strictEqual(result, true);
  });

  it('returns false for not equal array', () => {
    // action
    const result = arraysEqual(sampleArray, notEqualArray);

    // assert
    assert.strictEqual(result, false);
  });

  it('returns false for bad arguments', () => {
    // action
    const result = arraysEqual(sampleArray);

    // assert
    assert.strictEqual(result, false);
  });

  it('returns false for different arrays size', () => {
    // action
    const result = arraysEqual(sampleArray, []);

    // assert
    assert.strictEqual(result, false);
  });
});
