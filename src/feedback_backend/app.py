# src/feedback_backend/app.py
from flask import Flask, request, jsonify
from prometheus_flask_exporter import PrometheusMetrics
from flask_cors import CORS
import psycopg2
import os

from auth import require_auth  # if package layout; or use "from auth import require_auth" if same dir

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://172.20.10.3:30080"}})  # replace origin or use "*" for dev
metrics = PrometheusMetrics(app)

def get_db_conn():
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'postgres-service'),
        database='feedback',
        user='postgres',
        password=os.environ.get('DB_PASSWORD', 'password')
    )

@app.route('/api/message', methods=['POST'])
@require_auth
def save_message():
    data = request.get_json()
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("INSERT INTO messages (text) VALUES (%s)", (data['message'],))
    conn.commit()
    cur.close()
    conn.close()
    return '', 201

@app.route('/api/messages', methods=['GET'])
@require_auth
def get_messages():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, text FROM messages")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": row[0], "text": row[1]} for row in rows])

@app.route('/api/message/<int:msg_id>', methods=['DELETE'])
@require_auth
def delete_message(msg_id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
    conn.commit()
    cur.close()
    conn.close()
    return '', 204

if __name__ == '__main__':
    # don't use flask built-in server in production; for dev this is fine
    app.run(host='0.0.0.0', port=5000)
