import Circle from '../Circle';
import { toMock } from 'to-mock';

describe('Circle', () => {
  let circle = null;

  const entry = {
    read() {
      return 1;
    },
    write() {
      return true;
    },
    meta: {
      interval: 60,
    },
    args: [],
    time: -60,
  };

  const args = { event: 'event' };
  const payload = 111;

  const NativeDate = Date;
  const MockedDate = toMock(Date);

  beforeEach(() => {
    jest.spyOn(MockedDate, 'now').mockReturnValue(1);
    jest.spyOn(MockedDate.prototype, 'getTime').mockReturnValue({
      toString() {
        return 'random';
      },
    });

    circle = new Circle();
    Date = MockedDate; // eslint-disable-line no-global-assign
  });

  afterEach(() => {
    Date = NativeDate; // eslint-disable-line no-global-assign
  });

  it('should call listen method for registering first entry', () => {
    jest.spyOn(circle, '_listen').mockImplementation();

    circle.register(entry);

    expect(circle._listen).toHaveBeenCalled();
    expect(circle.getEntries().size).toEqual(1);
  });

  it('should call unlisten method for unregistering last entry', () => {
    jest.spyOn(circle, '_unlisten').mockImplementation();

    const id = circle.register(entry);
    circle.unregister(id);

    expect(circle._unlisten).toHaveBeenCalled();
    expect(circle.getEntries().size).toEqual(0);
  });

  it('should call read method which return right structure for write method', () => {
    jest.spyOn(entry, 'read').mockReturnValue(payload);

    circle.register(entry);
    const entries = Array.from(circle.getEntries().values());

    expect(circle.read(entries, args)).toMatchSnapshot();
    expect(entry.read).toHaveBeenCalledWith(args);
  });

  it('should call write method with right structure', () => {
    jest.spyOn(entry, 'write').mockImplementation();

    circle.register(entry);
    const entries = Array.from(circle.getEntries().values()).map((entry) =>
      Object.assign({ payload }, entry)
    );

    circle.write(entries, args);

    expect(entry.write).toHaveBeenCalledWith(
      Object.assign({ payload }, entry),
      args
    );
  });

  describe('execute method', () => {
    function run(iterator) {
      let result = iterator.next();

      while (result.done === false) {
        result = iterator.next();
      }

      return result;
    }

    it('should return empty array for locked circle', () => {
      circle.register(entry);

      circle.execute().next();
      let iterator = circle.execute(args);
      let iterableObject = run(iterator);

      expect(iterableObject.value).toEqual([]);
      expect(iterableObject.done).toBeTruthy();
    });

    it('should return empty array for empty circle', () => {
      let iterator = circle.execute(args);

      let iterableObject = run(iterator);

      expect(iterableObject.value).toEqual([]);
      expect(iterableObject.done).toBeTruthy();
    });

    it('should return empty array if all entries are filtered', () => {
      MockedDate.now.mockReturnValue(60);
      circle.register(entry);
      let iterator = circle.execute(args);
      MockedDate.now.mockReturnValue(30);

      let iterableObject = run(iterator);

      expect(iterableObject.value).toEqual([]);
      expect(iterableObject.done).toBeTruthy();
    });

    it('should return empty array if all entries are filtered 2', () => {
      MockedDate.now.mockReturnValue(60);
      circle.register(entry);
      let iterator = circle.execute(args);
      MockedDate.now.mockReturnValue(61);

      let iterableObject = run(iterator);

      expect(iterableObject.value).toEqual([undefined]);
      expect(iterableObject.done).toBeTruthy();
    });

    it('should call notify method if all entries were not be called with defined arguments', () => {
      jest.spyOn(circle, 'notify').mockImplementation();
      MockedDate.now.mockReturnValue(60);
      circle.register(entry);
      let iterator = circle.execute(args);
      MockedDate.now.mockReturnValue(30);

      let iterableObject = run(iterator);

      expect(circle.notify).toHaveBeenCalledWith(args);

      expect(iterableObject.value).toEqual([]);
      expect(iterableObject.done).toBeTruthy();
    });
  });
});
