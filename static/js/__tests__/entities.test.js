import { splitPlayerCell, handlePlayerSplit, updatePlayer, activateBoost } from '../entities.js';
import { gameState, mouse } from '../gameState.js';
import { MIN_SPLIT_SCORE, MAX_PLAYER_CELLS, BOOST_MULTIPLIER, BOOST_DURATION, BOOST_COOLDOWN, BOOST_MASS_COST } from '../config.js';

// Mock gameState and mouse
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    boost: {
      active: false,
      endTime: 0,
      cooldownEnd: 0
    }
  },
  mouse: { x: 0, y: 0 }
}));

describe('splitPlayerCell', () => {
  beforeEach(() => {
    gameState.playerCells = [];
  });

  test('does not split cell below minimum score', () => {
    const cell = { x: 100, y: 100, score: MIN_SPLIT_SCORE - 1 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0].score).toBe(MIN_SPLIT_SCORE - 1);
  });

  test('splits cell with sufficient score', () => {
    const cell = { x: 100, y: 100, score: 100 };
    gameState.playerCells = [cell];

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(2);
    expect(gameState.playerCells[0].score).toBe(50);
    expect(gameState.playerCells[1].score).toBe(50);
  });

  test('does not split when at max cells', () => {
    const cell = { x: 100, y: 100, score: 100 };
    gameState.playerCells = Array(MAX_PLAYER_CELLS).fill({ ...cell });

    splitPlayerCell(cell);

    expect(gameState.playerCells.length).toBe(MAX_PLAYER_CELLS);
  });
});

describe('handlePlayerSplit', () => {
  beforeEach(() => {
    gameState.playerCells = [];
  });

  test('splits all eligible cells', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 100 },
      { x: 200, y: 200, score: MIN_SPLIT_SCORE - 1 },
      { x: 300, y: 300, score: 100 }
    ];

    handlePlayerSplit();

    expect(gameState.playerCells.length).toBe(5);  // 2 split + 1 unchanged
  });
});

describe('updatePlayer', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    mouse.x = 0;
    mouse.y = 0;
  });

  test('moves player cells towards mouse', () => {
    const cell = { 
      x: 0, 
      y: 0, 
      score: 100, 
      velocityX: 0, 
      velocityY: 0 
    };
    gameState.playerCells = [cell];
    
    // Set mouse far to the right and run multiple updates to overcome inertia
    mouse.x = 1000;
    mouse.y = 0;
    
    // Run multiple updates to overcome initial inertia
    for (let i = 0; i < 5; i++) {
      updatePlayer();
    }

    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);  // Should move right
  });

  test('applies speed based on cell size', () => {
    const smallCell = { x: 100, y: 100, score: 100, velocityX: 0, velocityY: 0 };
    const largeCell = { x: 100, y: 100, score: 400, velocityX: 0, velocityY: 0 };

    // Test small cell
    gameState.playerCells = [smallCell];
    mouse.x = 200;
    updatePlayer();
    const smallCellSpeed = Math.abs(gameState.playerCells[0].velocityX);

    // Test large cell
    gameState.playerCells = [largeCell];
    mouse.x = 200;
    updatePlayer();
    const largeCellSpeed = Math.abs(gameState.playerCells[0].velocityX);

    expect(smallCellSpeed).toBeGreaterThan(largeCellSpeed);  // Smaller cells move faster
  });

  test('applies boost multiplier when boost is active', () => {
    const cell = { x: 0, y: 0, score: 100, velocityX: 0, velocityY: 0 };
    gameState.playerCells = [cell];
    mouse.x = 1000;
    mouse.y = 0;

    // Run without boost
    gameState.boost.active = false;
    gameState.boost.endTime = 0;
    gameState.boost.cooldownEnd = 0;
    updatePlayer();
    const normalVelocityX = Math.abs(gameState.playerCells[0].velocityX);

    // Reset cell and run with boost
    gameState.playerCells = [{ x: 0, y: 0, score: 100, velocityX: 0, velocityY: 0 }];
    gameState.boost.active = true;
    gameState.boost.endTime = Date.now() + BOOST_DURATION;
    updatePlayer();
    const boostedVelocityX = Math.abs(gameState.playerCells[0].velocityX);

    expect(boostedVelocityX).toBeGreaterThan(normalVelocityX);
  });

  test('deactivates boost after endTime has passed', () => {
    gameState.playerCells = [{ x: 0, y: 0, score: 100, velocityX: 0, velocityY: 0 }];
    gameState.boost.active = true;
    gameState.boost.endTime = Date.now() - 1; // Already expired
    mouse.x = 100;

    updatePlayer();

    expect(gameState.boost.active).toBe(false);
  });
});

describe('activateBoost', () => {
  beforeEach(() => {
    gameState.playerCells = [];
    gameState.boost.active = false;
    gameState.boost.endTime = 0;
    gameState.boost.cooldownEnd = 0;
  });

  test('activates boost when conditions are met', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 200 }];

    activateBoost();

    expect(gameState.boost.active).toBe(true);
    expect(gameState.boost.endTime).toBeGreaterThan(Date.now() - 100);
    expect(gameState.boost.cooldownEnd).toBeGreaterThan(gameState.boost.endTime);
  });

  test('does not activate when boost is already active', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 200 }];
    gameState.boost.active = true;
    gameState.boost.endTime = Date.now() + 5000;

    const originalEndTime = gameState.boost.endTime;
    activateBoost();

    expect(gameState.boost.endTime).toBe(originalEndTime); // Unchanged
  });

  test('does not activate during cooldown', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 200 }];
    gameState.boost.cooldownEnd = Date.now() + 5000;

    activateBoost();

    expect(gameState.boost.active).toBe(false);
  });

  test('deducts mass cost from each cell', () => {
    gameState.playerCells = [
      { x: 100, y: 100, score: 200 },
      { x: 200, y: 200, score: 100 }
    ];

    activateBoost();

    expect(gameState.playerCells[0].score).toBeCloseTo(200 * (1 - BOOST_MASS_COST));
    expect(gameState.playerCells[1].score).toBeCloseTo(100 * (1 - BOOST_MASS_COST));
  });

  test('does not activate when total score is too low after mass cost', () => {
    // minScoreAfterBoost is 30, so totalScore * 0.9 < 30 means totalScore < 33.33
    gameState.playerCells = [{ x: 100, y: 100, score: 30 }];

    activateBoost();

    expect(gameState.boost.active).toBe(false);
    expect(gameState.playerCells[0].score).toBe(30); // Score unchanged
  });

  test('sets correct endTime and cooldownEnd timestamps', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 200 }];
    const beforeActivation = Date.now();

    activateBoost();

    const afterActivation = Date.now();
    expect(gameState.boost.endTime).toBeGreaterThanOrEqual(beforeActivation + BOOST_DURATION);
    expect(gameState.boost.endTime).toBeLessThanOrEqual(afterActivation + BOOST_DURATION);
    expect(gameState.boost.cooldownEnd).toBeGreaterThanOrEqual(beforeActivation + BOOST_DURATION + BOOST_COOLDOWN);
    expect(gameState.boost.cooldownEnd).toBeLessThanOrEqual(afterActivation + BOOST_DURATION + BOOST_COOLDOWN);
  });

  test('activates after cooldown has expired', () => {
    gameState.playerCells = [{ x: 100, y: 100, score: 200 }];
    gameState.boost.cooldownEnd = Date.now() - 1; // Cooldown already expired

    activateBoost();

    expect(gameState.boost.active).toBe(true);
  });
});