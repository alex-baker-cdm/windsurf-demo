import { WORLD_SIZE, STARTING_SCORE, BOOST_DURATION, BOOST_COOLDOWN } from './config.js';

export const gameState = {
    playerCells: [{
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        score: STARTING_SCORE,
        velocityX: 0,
        velocityY: 0
    }],
    playerName: 'Windsurf',
    camera: {
        x: 0,
        y: 0
    },
    food: [],
    aiPlayers: [],
    boost: {
        active: false,
        startTime: 0,
        lastUsedTime: 0
    }
};

export function activateBoost() {
    const now = Date.now();
    const timeSinceLastUse = now - gameState.boost.lastUsedTime;
    if (gameState.boost.active || timeSinceLastUse < BOOST_COOLDOWN) {
        return false;
    }
    gameState.boost.active = true;
    gameState.boost.startTime = now;
    gameState.boost.lastUsedTime = now;
    return true;
}

export function updateBoostState() {
    if (!gameState.boost.active) return;
    const elapsed = Date.now() - gameState.boost.startTime;
    if (elapsed >= BOOST_DURATION) {
        gameState.boost.active = false;
    }
}

export function getBoostCooldownRemaining() {
    const now = Date.now();
    if (gameState.boost.active) {
        return BOOST_COOLDOWN;
    }
    const elapsed = now - gameState.boost.lastUsedTime;
    return Math.max(0, BOOST_COOLDOWN - elapsed);
}

export function getBoostDurationRemaining() {
    if (!gameState.boost.active) return 0;
    const elapsed = Date.now() - gameState.boost.startTime;
    return Math.max(0, BOOST_DURATION - elapsed);
}

export const mouse = { x: 0, y: 0 };