from flask import Flask, request, jsonify
from flask_cors import CORS
from prometheus_flask_exporter import PrometheusMetrics
import psycopg2
import os
import jwt
import requests
from functools import wraps
import json

app = Flask(__name__)
CORS(app)
metrics = PrometheusMetrics(app)

# Keycloak configuration
KEYCLOAK_SERVER_URL = os.environ.get('KEYCLOAK_SERVER_URL', 'http://localhost:8080')
KEYCLOAK_REALM = os.environ.get('KEYCLOAK_REALM', 'feedback-realm')
KEYCLOAK_CLIENT_ID = os.environ.get('KEYCLOAK_CLIENT_ID', 'feedback_backend')

# Cache for public keys
keycloak_public_key = None

def get_keycloak_public_key():
    """Fetch Keycloak public key for JWT verification"""
    global keycloak_public_key
    
    if keycloak_public_key is None:
        try:
            # Get realm public key
            url = f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}"
            response = requests.get(url)
            realm_info = response.json()
            
            # Format the public key
            public_key_str = realm_info['public_key']
            keycloak_public_key = f"-----BEGIN PUBLIC KEY-----\n{public_key_str}\n-----END PUBLIC KEY-----"
        except Exception as e:
            print(f"Error fetching Keycloak public key: {e}")
            return None
    
    return keycloak_public_key

def token_required(f):
    """Decorator to validate JWT tokens"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Get Keycloak public key
            public_key = get_keycloak_public_key()
            if not public_key:
                return jsonify({'message': 'Unable to verify token'}), 401
            
            # Decode and verify JWT
            decoded_token = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=KEYCLOAK_CLIENT_ID,
                issuer=f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}"
            )
            
            # Add user info to request context
            request.current_user = decoded_token
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'message': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            return jsonify({'message': f'Token validation error: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    return decorated

def get_db_conn():
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'postgres-service'),
        database='feedback',
        user='postgres',
        password=os.environ.get('DB_PASSWORD', 'password')
    )

# Health check endpoint (no auth required)
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

# Protected endpoints
@app.route('/api/message', methods=['POST'])
@token_required
def save_message():
    data = request.get_json()
    user_id = request.current_user.get('sub')  # Get user ID from token
    username = request.current_user.get('preferred_username', 'unknown')
    
    conn = get_db_conn()
    cur = conn.cursor()
    
    # Store message with user info
    cur.execute(
        "INSERT INTO messages (text, user_id, username) VALUES (%s, %s, %s)", 
        (data['message'], user_id, username)
    )
    conn.commit()
    cur.close()
    conn.close()
    return '', 201

@app.route('/api/messages', methods=['GET'])
@token_required
def get_messages():
    conn = get_db_conn()
    cur = conn.cursor()
    
    # Get messages with user info
    cur.execute("SELECT id, text, username, created_at FROM messages ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    messages = []
    for row in rows:
        messages.append({
            "id": row[0], 
            "text": row[1],
            "username": row[2] if row[2] else "unknown",
            "created_at": row[3].isoformat() if row[3] else None
        })
    
    return jsonify(messages)

@app.route('/api/message/<int:msg_id>', methods=['DELETE'])
@token_required
def delete_message(msg_id):
    user_id = request.current_user.get('sub')
    
    conn = get_db_conn()
    cur = conn.cursor()
    
    # Only allow users to delete their own messages (or admin role)
    # For now, allow any authenticated user to delete
    cur.execute("DELETE FROM messages WHERE id = %s", (msg_id,))
    conn.commit()
    cur.close()
    conn.close()
    return '', 204

# User info endpoint
@app.route('/api/user', methods=['GET'])
@token_required
def get_user_info():
    return jsonify({
        'user_id': request.current_user.get('sub'),
        'username': request.current_user.get('preferred_username'),
        'email': request.current_user.get('email'),
        'roles': request.current_user.get('realm_access', {}).get('roles', [])
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)