import uuid from '../uuid';

describe('uuid method', () => {
  it('should generate random token as string', () => {
    expect(typeof uuid() === 'string').toBeTruthy();
  });

  it('should generate different token for two calling that method', () => {
    expect(uuid() !== uuid()).toBeTruthy();
  });
});
