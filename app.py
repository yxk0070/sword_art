from flask import Flask, jsonify, request, render_template
import random
from game import generate_sample_data, Character, BattleEngine

app = Flask(__name__)

# Global state for simplicity in this prototype
game_state = {}

def init_game():
    moves_lib = generate_sample_data()
    player = Character("玩家(少侠)", hp=500, inner_amount=10, inner_mastery=5, agility=50, weapon_atk=10, armor_def=5)
    enemy = Character("山贼头目", hp=600, inner_amount=8, inner_mastery=4, agility=30, weapon_atk=15, armor_def=10)
    engine = BattleEngine(player, enemy)
    
    game_state['moves_lib'] = moves_lib
    game_state['player'] = player
    game_state['enemy'] = enemy
    game_state['engine'] = engine
    game_state['game_over'] = False
    game_state['winner'] = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/state', methods=['GET'])
def get_state():
    if not game_state:
        init_game()
        
    # Generate enemy intent for the next turn
    enemy_moves = []
    e_dur = 0
    moves_lib = game_state['moves_lib']
    while e_dur < 12:
        m = random.choice(moves_lib)
        if e_dur + m.duration <= 12:
            enemy_moves.append(m)
            e_dur += m.duration
        else:
            break
            
    game_state['next_enemy_moves'] = enemy_moves
        
    return jsonify({
        'player': game_state['player'].to_dict(),
        'enemy': game_state['enemy'].to_dict(),
        'turn': game_state['engine'].turn,
        'game_over': game_state['game_over'],
        'winner': game_state['winner'],
        'moves': [m.to_dict() for m in game_state['moves_lib']],
        'enemy_intent': [m.name for m in enemy_moves]
    })

@app.route('/api/play', methods=['POST'])
def play_turn():
    if not game_state or game_state['game_over']:
        return jsonify({'error': 'Game is over or not initialized'}), 400
        
    data = request.json
    move_indices = data.get('moves', [])
    
    moves_lib = game_state['moves_lib']
    engine = game_state['engine']
    player = game_state['player']
    enemy = game_state['enemy']
    
    player_moves = []
    total_duration = 0
    for idx in move_indices:
        if 0 <= idx < len(moves_lib):
            m = moves_lib[idx]
            if total_duration + m.duration <= 12:
                player_moves.append(m)
                total_duration += m.duration
                
    enemy_moves = game_state.get('next_enemy_moves', [])
    if not enemy_moves:
        e_dur = 0
        while e_dur < 12:
            m = random.choice(moves_lib)
            if e_dur + m.duration <= 12:
                enemy_moves.append(m)
                e_dur += m.duration
            else:
                break
                
    logs, hp_history = engine.play_turn(player_moves, enemy_moves)
    
    # Generate new intent for next turn
    new_enemy_moves = []
    e_dur = 0
    while e_dur < 12:
        m = random.choice(moves_lib)
        if e_dur + m.duration <= 12:
            new_enemy_moves.append(m)
            e_dur += m.duration
        else:
            break
    game_state['next_enemy_moves'] = new_enemy_moves
    
    if not player.is_alive():
        game_state['game_over'] = True
        game_state['winner'] = enemy.name
    elif not enemy.is_alive():
        game_state['game_over'] = True
        game_state['winner'] = player.name
        
    return jsonify({
        'logs': logs,
        'hp_history': hp_history,
        'player': player.to_dict(),
        'enemy': enemy.to_dict(),
        'turn': engine.turn,
        'game_over': game_state['game_over'],
        'winner': game_state['winner'],
        'enemy_intent': [m.name for m in new_enemy_moves]
    })

@app.route('/api/reset', methods=['POST'])
def reset_game():
    init_game()
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
