from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime

app = Flask(__name__)

nodes = ["Node-A", "Node-B", "Node-C"]

LOG_FILE = './Logs/logFile.txt'

@app.route('/log-ip', methods=['POST'])
def log_ip():
    try:
        # Get the data from the request body
        data = request.get_json()
        ip = data['ip']
        node = data['node']

        # Prepare the log entry
        log_entry = f"{[str(datetime.now())]} --> {ip} --> {node}\n"

        # Write the log entry to the file
        with open(LOG_FILE, 'a') as file:
            file.write(log_entry)

        return jsonify({'message': 'IP Logged'}), 200
    except Exception as e:
        return jsonify({'message': f'Error Logging IP: {str(e)}'}), 500


@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="localhost", port=5000, debug=True)