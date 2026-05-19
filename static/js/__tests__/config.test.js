import {
  BOOST_MULTIPLIER,
  BOOST_DURATION,
  BOOST_COOLDOWN,
  BOOST_MASS_COST
} from '../config.js';

describe('boost config constants', () => {
  test('BOOST_MULTIPLIER is greater than 1', () => {
    expect(BOOST_MULTIPLIER).toBeGreaterThan(1);
  });

  test('BOOST_DURATION is a positive number in milliseconds', () => {
    expect(BOOST_DURATION).toBeGreaterThan(0);
  });

  test('BOOST_COOLDOWN is greater than BOOST_DURATION', () => {
    expect(BOOST_COOLDOWN).toBeGreaterThan(BOOST_DURATION);
  });

  test('BOOST_MASS_COST is between 0 and 1 (exclusive)', () => {
    expect(BOOST_MASS_COST).toBeGreaterThan(0);
    expect(BOOST_MASS_COST).toBeLessThan(1);
  });

  test('boost constants have expected default values', () => {
    expect(BOOST_MULTIPLIER).toBe(2.5);
    expect(BOOST_DURATION).toBe(2000);
    expect(BOOST_COOLDOWN).toBe(5000);
    expect(BOOST_MASS_COST).toBe(0.1);
  });
});
