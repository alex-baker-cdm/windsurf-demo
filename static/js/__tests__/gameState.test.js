import { gameState, mouse } from '../gameState.js';

describe('gameState boost initialization', () => {
  test('boost object exists on gameState', () => {
    expect(gameState.boost).toBeDefined();
  });

  test('boost starts inactive', () => {
    expect(gameState.boost.active).toBe(false);
  });

  test('boost endTime starts at 0', () => {
    expect(gameState.boost.endTime).toBe(0);
  });

  test('boost cooldownEnd starts at 0', () => {
    expect(gameState.boost.cooldownEnd).toBe(0);
  });

  test('boost has all required properties', () => {
    expect(gameState.boost).toEqual({
      active: false,
      endTime: 0,
      cooldownEnd: 0
    });
  });
});

describe('mouse state', () => {
  test('mouse starts at origin', () => {
    expect(mouse).toEqual({ x: 0, y: 0 });
  });
});
