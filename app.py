"""
Flask backend for a multiplayer browser game with AI-controlled players.

Serves the game UI and exposes REST endpoints for retrieving game state
and processing player position updates.
"""

from flask import Flask, render_template, jsonify, request
import numpy as np
import json

app = Flask(__name__)

# Game state
# ---------------------------------------------------------------------------
# Configuration constants that define the game world dimensions, the number
# of AI opponents, and how much food is scattered across the map.
# ---------------------------------------------------------------------------
WORLD_SIZE = 2000  # Total width/height of the game map in pixels
NUM_AI_PLAYERS = 10  # Number of computer-controlled opponents
NUM_FOOD = 100  # Food items spawned on the map at any given time


@app.route('/')
def index():
    """Render the main game page."""
    return render_template('game.html')


@app.route('/game_state')
def game_state():
    """Return the current game state as JSON.

    In a real implementation, this would update AI positions and return
    current game state including player locations, scores, and food items.
    """
    return jsonify({'status': 'ok'})


@app.route('/update_player', methods=['POST'])
def update_player():
    """Accept a player position update via POST and return confirmation.

    Expects a JSON body with the player's latest coordinates.
    """
    # Parse the incoming JSON body for the player's x/y coordinates
    data = request.get_json()
    # TODO: validate payload and persist the new position in game state
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    # Start the development server with hot-reload enabled
    app.run(debug=True)