from flask import Flask, request, jsonify
from flask_cors import CORS
from keycloak import KeycloakOpenID
import psycopg2
import os
from functools import wraps

app = Flask(__name__)
CORS(app)  # Allow frontend to call backend

# Keycloak config
keycloak_openid = KeycloakOpenID(
    server_url="http://172.20.10.5:31830",  # Internal service name in K8s
    client_id="feedback_backend",
    realm_name="myrealm",
    client_secret_key="St1eLjjs10TQrqKTtRcdMC0WrqXioBge"  # If confidential client
)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({"error": "Unauthorized"}), 401
        try:
            token = auth_header.split(" ")[1]
            token_info = keycloak_openid.introspect(token)
            if not token_info.get("active"):
                return jsonify({"error": "Token inactive"}), 401
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
        return f(*args, **kwargs)
    return decorated

def get_db_conn():
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'postgres-service'),
        database='feedback',
        user='postgres',
        password=os.environ.get('DB_PASSWORD', 'password')
    )

@app.route('/api/message', methods=['POST'])
@token_required
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
@token_required
def get_messages():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, text FROM messages")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": row[0], "text": row[1]} for row in rows])

@app.route('/api/message/<int:msg_id>', methods=['DELETE'])
@token_required
def delete_message(msg_id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
    conn.commit()
    cur.close()
    conn.close()
    return '', 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
