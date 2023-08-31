# app.py
from flask import Flask, render_template, request, jsonify
import json

from good_time_to_invest.etf_math import top_level_calculation

app = Flask(__name__)

# app.py
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        data = request.json

        result_stats = top_level_calculation(
                                    float(data['fixed_rate']),
                                    float(data['variable_rate']),
                                    float(data['monthly_deposit']),
                                    float(data['yearly_growth']),
                                    int(data['months_to_simulate']))
        
        print(result_stats)

        return jsonify(result_stats)
    else:
        return render_template("index.html")

@app.route("/banks", methods=["GET"])
def banks():
    with open("./data/banks.json", 'r') as bank_file:
        load_json = json.load(bank_file)

        return load_json

if __name__ == "__main__":
    app.run(debug=True)