from flask import Blueprint, request, jsonify
from vision_studio.presentation.api.auth import generate_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    
    # In a real app, you would verify against MongoDB User collection.
    # For now, we mock a simple admin login.
    if username == "admin" and password == "admin":
        token = generate_token(user_id="admin_1", role="admin")
        return jsonify({"token": token, "role": "admin"})
        
    if username == "operator" and password == "operator":
        token = generate_token(user_id="op_1", role="operator")
        return jsonify({"token": token, "role": "operator"})
        
    return jsonify({"error": "Invalid credentials"}), 401
