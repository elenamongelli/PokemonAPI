from flask import Flask, render_template
import json

app = Flask(__name__)

@app.route('/')
def index():
    with open('pokemon_data.json', 'r') as f:
        data = json.load(f)
    return render_template('index.html', pokemon_list=data)

@app.route('/pokemon/<int:pokemon_id>')
def pokemon_detail(pokemon_id):
    with open('pokemon_data.json', 'r') as f:
        data = json.load(f)
    
    # Find the Pokemon with the given ID
    pokemon = next((p for p in data if p['id'] == pokemon_id), None)

    if pokemon:
        return render_template('pokemon_detail.html', pokemon=pokemon)
    else:
        return 'Pokemon not found', 404

if __name__ == '__main__':
    app.run(debug=True)
