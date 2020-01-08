import Infinite from '../Infinite';
import { toMock } from 'to-mock';

jest.useFakeTimers();

describe('Infinite', () => {
  let infinite = null;

  const NativeDate = Date;
  const MockedDate = toMock(Date);

  beforeEach(() => {
    infinite = new Infinite();
    Date = MockedDate; // eslint-disable-line no-global-assign
  });

  afterEach(() => {
    Date = NativeDate; // eslint-disable-line no-global-assign
  });

  it('should not suspend execution when next execution time is now', () => {
    MockedDate.now = jest.fn().mockReturnValue(1);
    infinite._nextExecutionTime = 1;
    infinite._execute = jest.fn();

    infinite._suspendExecution();

    expect(infinite._execute).toHaveBeenCalledWith([]);
  });

  it('should suspend execution when next execution time is not now and request animation frame is defined', () => {
    let requestAnimationFrame = jest.fn();
    MockedDate.now = jest.fn().mockReturnValue(1);
    infinite._nextExecutionTime = 2;
    infinite._requestAnimationFrame = jest
      .fn()
      .mockReturnValue(requestAnimationFrame);

    infinite._suspendExecution();

    expect(requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should suspend execution when next execution time is not now and request animation frame is defined', () => {
    MockedDate.now = jest.fn().mockReturnValue(1);
    infinite._nextExecutionTime = 2;
    infinite._requestAnimationFrame = jest.fn();

    infinite._suspendExecution();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Number)
    );
  });
});
