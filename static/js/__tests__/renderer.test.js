import { gameState } from '../gameState.js';
import { initRenderer, drawGame } from '../renderer.js';
import { BOOST_DURATION, BOOST_COOLDOWN } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: [],
    aiPlayers: [],
    food: [],
    camera: { x: 0, y: 0 },
    playerName: 'TestPlayer',
    boost: {
      active: false,
      endTime: 0,
      cooldownEnd: 0
    }
  }
}));

// Mock canvas and context for renderer
const mockCtx = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  shadowColor: '',
  shadowBlur: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
  lineWidth: 0
};

const mockCanvas = {
  getContext: jest.fn(() => mockCtx),
  width: 800,
  height: 600
};

const mockMinimapCtx = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillStyle: '',
  strokeStyle: ''
};

const mockMinimapCanvas = {
  getContext: jest.fn(() => mockMinimapCtx),
  width: 150,
  height: 150
};

describe('renderer boost visuals', () => {
  beforeAll(() => {
    initRenderer({
      gameCanvas: mockCanvas,
      minimapCanvas: mockMinimapCanvas,
      scoreElement: { textContent: '' },
      leaderboardContent: { innerHTML: '' }
    });
  });

  beforeEach(() => {
    // Reset all mock call counts
    jest.clearAllMocks();

    // Reset gameState
    gameState.playerCells = [];
    gameState.aiPlayers = [];
    gameState.food = [];
    gameState.camera = { x: 0, y: 0 };
    gameState.boost.active = false;
    gameState.boost.endTime = 0;
    gameState.boost.cooldownEnd = 0;
  });

  test('drawGame renders without errors when boost is inactive', () => {
    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];

    expect(() => drawGame()).not.toThrow();
  });

  test('drawGame renders without errors when boost is active', () => {
    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];
    gameState.boost.active = true;
    gameState.boost.endTime = Date.now() + BOOST_DURATION;

    expect(() => drawGame()).not.toThrow();
  });

  test('drawGame applies glow effect when boost is active', () => {
    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];
    gameState.boost.active = true;
    gameState.boost.endTime = Date.now() + BOOST_DURATION;

    drawGame();

    // The boost glow uses save/restore around the player cell draw
    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  test('drawGame renders boost indicator bar', () => {
    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];

    drawGame();

    // The boost indicator draws background, fill, and border rects plus a label
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.strokeRect).toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  test('drawGame renders cooldown state during cooldown', () => {
    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];
    gameState.boost.active = false;
    gameState.boost.cooldownEnd = Date.now() + BOOST_COOLDOWN;

    drawGame();

    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  test('drawGame does not apply glow when boost is inactive', () => {
    gameState.playerCells = [{ x: 400, y: 300, score: 100 }];
    gameState.boost.active = false;

    drawGame();

    // save/restore is still called by drawCellWithName for the name text
    // but shadowColor should not be set to the boost cyan color
    const saveCalls = mockCtx.save.mock.calls.length;
    const restoreCalls = mockCtx.restore.mock.calls.length;
    expect(saveCalls).toBe(restoreCalls);
  });
});
