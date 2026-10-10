import asyncio
from flask import Blueprint, jsonify, request
import logging

from vision_studio.presentation.api.webrtc_server import get_webrtc_loop, process_offer
from vision_studio.presentation.api.auth import require_auth

logger = logging.getLogger(__name__)
webrtc_bp = Blueprint("webrtc", __name__)

@webrtc_bp.route("/offer", methods=["POST"])
@require_auth
def offer():
    data = request.json
    if not data or "sdp" not in data or "type" not in data:
        return jsonify({"error": "Missing sdp or type in request JSON"}), 400
        
    project_id = data.get("project_id")
    session_id = data.get("session_id")
    
    if not project_id or not session_id:
        return jsonify({"error": "Missing project_id or session_id in request JSON"}), 400
        
    loop = get_webrtc_loop()
    
    # Run the coroutine in the background WebRTC thread and wait for result
    future = asyncio.run_coroutine_threadsafe(
        process_offer(data["sdp"], data["type"], project_id, session_id), 
        loop
    )
    
    try:
        result = future.result(timeout=10.0)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing WebRTC offer: {e}")
        return jsonify({"error": str(e)}), 500
