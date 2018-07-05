import arraysEqual from '../arraysEqual';

describe('arraysEqual method', () => {
  const string = 'string';
  const object = { property: 'value' };
  const number = 1;
  const array = ['value'];

  const sampleArray = [string, object, number, array];
  const equalArray = [string, object, number, array];
  const notEqualArray = [string, object, array, number];
  it('should return true for same array', () => {
    expect(arraysEqual(sampleArray, sampleArray)).toBeTruthy();
  });

  it('should return true for equal array', () => {
    expect(arraysEqual(sampleArray, equalArray)).toBeTruthy();
  });

  it('should return false for not equal array', () => {
    expect(arraysEqual(sampleArray, notEqualArray)).toBeFalsy();
  });

  it('should return false for bad arguments', () => {
    expect(arraysEqual(sampleArray)).toBeFalsy();
  });

  it('should return false for different arrays size', () => {
    expect(arraysEqual(sampleArray, [])).toBeFalsy();
  });
});
