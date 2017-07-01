import BoolBuilder, { bool } from '../src/BoolBuilder';

describe('BoolBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new BoolBuilder(true);
  });

  describe('runChecks()', () => {
    it('errors if a non-boolean value is used', () => {
      expect(() => {
        builder.runChecks('key', 123);
      }).toThrowError('Invalid option "key". Must be a boolean.');
    });

    it('doesnt support null', () => {
      expect(() => {
        builder.runChecks('key', null);
      }).toThrowError('Invalid option "key". Must be a boolean.');
    });
  });
});

describe('bool()', () => {
  it('returns a builder', () => {
    expect(bool(true)).toBeInstanceOf(BoolBuilder);
  });
});
