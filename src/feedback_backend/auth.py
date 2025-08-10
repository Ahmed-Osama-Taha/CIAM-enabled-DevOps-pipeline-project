# src/feedback_backend/auth.py
import os
from functools import wraps
from flask import request, jsonify, g
import jwt
from jwt import PyJWKClient

KEYCLOAK_BASE_URL = os.environ.get('KEYCLOAK_BASE_URL', 'http://localhost:3050')  # replace if needed
REALM = os.environ.get('KEYCLOAK_REALM', 'myrealm')
JWKS_URL = f"{KEYCLOAK_BASE_URL}/realms/{REALM}/protocol/openid-connect/certs"
ISSUER = f"{KEYCLOAK_BASE_URL}/realms/{REALM}"

jwk_client = PyJWKClient(JWKS_URL)

def _get_bearer_token():
    auth = request.headers.get('Authorization', '')
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1]
    return None

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = _get_bearer_token()
        if not token:
            return jsonify({'error': 'missing token'}), 401

        try:
            signing_key = jwk_client.get_signing_key_from_jwt(token).key
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                issuer=ISSUER,
                options={"verify_aud": False}  # set to True and audience='...' to enforce audience check
            )
            # attach user info to request context
            g.user = payload
        except Exception as e:
            return jsonify({'error': 'invalid token', 'message': str(e)}), 401

        return f(*args, **kwargs)
    return wrapper
