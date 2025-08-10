# auth.py
import requests
from jose import jwt
from flask import request, jsonify
import os

KEYCLOAK_URL = os.getenv("KEYCLOAK_URL", "http://keycloak.default.svc.cluster.local")
REALM = os.getenv("KEYCLOAK_REALM", "myrealm")

# Fetch public key from Keycloak to verify JWT
def get_public_key():
    url = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"
    res = requests.get(url)
    res.raise_for_status()
    jwks = res.json()
    return jwks

JWKS = get_public_key()

def token_required(f):
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split(" ")[1]

        try:
            # Decode the token using Keycloak's JWKS
            jwt.decode(
                token,
                JWKS,
                algorithms=["RS256"],
                audience="feedback_backend",  # Must match clientId in Keycloak for backend
                options={"verify_aud": False}  # Disable if no audience check
            )
        except Exception as e:
            return jsonify({"error": f"Token verification failed: {str(e)}"}), 401

        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper
