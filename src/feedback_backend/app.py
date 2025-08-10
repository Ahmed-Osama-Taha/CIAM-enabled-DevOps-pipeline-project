from flask import Flask, jsonify, request
from auth import token_required

app = Flask(__name__)

messages = [
    {"id": 1, "text": "Welcome to the feedback app!"}
]

@app.route("/api/messages", methods=["GET"])
@token_required
def get_messages():
    return jsonify(messages)

@app.route("/api/message", methods=["POST"])
@token_required
def add_message():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Message is required"}), 400
    new_id = len(messages) + 1
    messages.append({"id": new_id, "text": data["message"]})
    return jsonify({"status": "success"}), 201

@app.route("/api/message/<int:msg_id>", methods=["DELETE"])
@token_required
def delete_message(msg_id):
    global messages
    messages = [m for m in messages if m["id"] != msg_id]
    return jsonify({"status": "deleted"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
