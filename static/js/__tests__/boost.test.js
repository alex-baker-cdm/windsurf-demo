import { BOOST_DURATION, BOOST_COOLDOWN } from '../config.js';

// Direct test of boost state logic
describe('boost state management', () => {
  let gameState, activateBoost, updateBoostState, getBoostCooldownRemaining, getBoostDurationRemaining;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(10000);

    const mod = require('../gameState.js');
    gameState = mod.gameState;
    activateBoost = mod.activateBoost;
    updateBoostState = mod.updateBoostState;
    getBoostCooldownRemaining = mod.getBoostCooldownRemaining;
    getBoostDurationRemaining = mod.getBoostDurationRemaining;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('activateBoost activates when off cooldown', () => {
    const result = activateBoost();
    expect(result).toBe(true);
    expect(gameState.boost.active).toBe(true);
  });

  test('activateBoost fails when already active', () => {
    activateBoost();
    const result = activateBoost();
    expect(result).toBe(false);
  });

  test('activateBoost fails during cooldown', () => {
    activateBoost();
    // Advance past boost duration but not past cooldown
    jest.advanceTimersByTime(BOOST_DURATION + 100);
    updateBoostState();
    expect(gameState.boost.active).toBe(false);

    const result = activateBoost();
    expect(result).toBe(false);
  });

  test('activateBoost succeeds after cooldown expires', () => {
    activateBoost();
    jest.advanceTimersByTime(BOOST_COOLDOWN + 100);
    updateBoostState();

    const result = activateBoost();
    expect(result).toBe(true);
  });

  test('updateBoostState deactivates after duration', () => {
    activateBoost();
    expect(gameState.boost.active).toBe(true);

    jest.advanceTimersByTime(BOOST_DURATION + 1);
    updateBoostState();
    expect(gameState.boost.active).toBe(false);
  });

  test('getBoostDurationRemaining returns remaining time', () => {
    activateBoost();
    jest.advanceTimersByTime(1000);
    const remaining = getBoostDurationRemaining();
    expect(remaining).toBe(BOOST_DURATION - 1000);
  });

  test('getBoostDurationRemaining returns 0 when not active', () => {
    expect(getBoostDurationRemaining()).toBe(0);
  });

  test('getBoostCooldownRemaining returns cooldown time after use', () => {
    activateBoost();
    jest.advanceTimersByTime(BOOST_DURATION + 100);
    updateBoostState();

    const remaining = getBoostCooldownRemaining();
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(BOOST_COOLDOWN);
  });

  test('getBoostCooldownRemaining returns 0 when ready', () => {
    expect(getBoostCooldownRemaining()).toBe(0);
  });
});
