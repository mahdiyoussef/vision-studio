import asyncio
import threading
import logging
import cv2

try:
    from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
    from av import VideoFrame
except ImportError:
    RTCPeerConnection = None
    RTCSessionDescription = None
    MediaStreamTrack = object
    VideoFrame = None

from dependency_injector.wiring import Provide, inject
from vision_studio.application.services.di_container import Container
from vision_studio.application.use_cases.run_inference import RunInferenceUseCase

logger = logging.getLogger(__name__)

# Global asyncio loop for WebRTC
_webrtc_loop = None
_webrtc_thread = None

def _run_webrtc_loop(loop: asyncio.AbstractEventLoop):
    asyncio.set_event_loop(loop)
    try:
        loop.run_forever()
    finally:
        loop.close()

def start_webrtc_thread():
    global _webrtc_loop, _webrtc_thread
    if _webrtc_thread is not None:
        return
        
    _webrtc_loop = asyncio.new_event_loop()
    _webrtc_thread = threading.Thread(
        target=_run_webrtc_loop, 
        args=(_webrtc_loop,), 
        daemon=True,
        name="WebRTCThread"
    )
    _webrtc_thread.start()
    logger.info("Started dedicated WebRTC asyncio thread.")

def get_webrtc_loop() -> asyncio.AbstractEventLoop:
    if _webrtc_loop is None:
        start_webrtc_thread()
    return _webrtc_loop


class VisionVideoTransformTrack(MediaStreamTrack):
    """
    A video stream track that transforms frames from an input track.
    Injects the frame into RunInferenceUseCase.
    """
    kind = "video"

    @inject
    def __init__(self, track, project_id: str, session_id: str, use_case: RunInferenceUseCase = Provide[Container.run_inference_use_case]):
        super().__init__()
        self.track = track
        self.project_id = project_id
        self.session_id = session_id
        self.use_case = use_case

    async def recv(self):
        frame = await self.track.recv()
        
        if VideoFrame is None:
            return frame

        img = frame.to_ndarray(format="bgr24")

        try:
            # Run inference in thread to avoid blocking asyncio loop
            loop = asyncio.get_event_loop()
            dto = await loop.run_in_executor(None, self.use_case.execute, self.project_id, self.session_id, img)
            
            # Overlay bounding boxes
            for det in dto.detections:
                if det.box:
                    cv2.rectangle(img, (int(det.box.x_min), int(det.box.y_min)), (int(det.box.x_max), int(det.box.y_max)), (0, 0, 255), 2)
                    label = f"{det.class_name} {det.confidence:.2f}"
                    cv2.putText(img, label, (int(det.box.x_min), int(det.box.y_min) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # Overlay measurements
            y_offset = 30
            for m in dto.measurements:
                color = (0, 255, 0) if m.passed else (0, 0, 255)
                text = f"{m.name}: {m.value:.2f} {m.unit}"
                cv2.putText(img, text, (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
                y_offset += 25
                
        except Exception as e:
            logger.error(f"Inference error in WebRTC track: {e}")

        new_frame = VideoFrame.from_ndarray(img, format="bgr24")
        new_frame.pts = frame.pts
        new_frame.time_base = frame.time_base
        return new_frame

async def process_offer(offer_sdp, offer_type, project_id: str, session_id: str):
    if RTCPeerConnection is None:
        raise RuntimeError("aiortc is not installed. Please install aiortc to use WebRTC.")
    pc = RTCPeerConnection()
    
    @pc.on("track")
    def on_track(track):
        logger.info("Track %s received", track.kind)
        if track.kind == "video":
            local_video = VisionVideoTransformTrack(track, project_id, session_id)
            pc.addTrack(local_video)

    offer = RTCSessionDescription(sdp=offer_sdp, type=offer_type)
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    
    return {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
