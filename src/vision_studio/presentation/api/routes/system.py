from flask import Blueprint, jsonify
import psutil
import platform
import subprocess

system_bp = Blueprint('system', __name__, url_prefix='/api/system')

def get_cpu_model():
    try:
        with open("/proc/cpuinfo", "r") as f:
            for line in f:
                if "model name" in line:
                    return line.split(":")[1].strip()
    except Exception:
        pass
    return platform.processor()

def get_gpu_info():
    try:
        output = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name,memory.used,memory.total", "--format=csv,noheader,nounits"],
            encoding="utf-8"
        )
        lines = output.strip().split("\n")
        if lines:
            name, used, total = lines[0].split(",")
            used_gb = float(used) / 1024
            total_gb = float(total) / 1024
            percent = (used_gb / total_gb) * 100
            return {
                "used_gb": round(used_gb, 1),
                "total_gb": round(total_gb, 1),
                "percent": percent,
                "model": name.strip()
            }
    except Exception:
        pass
    
    # Fallback to RAM if no GPU
    ram = psutil.virtual_memory()
    return {
        "used_gb": round(ram.used / (1024**3), 1),
        "total_gb": round(ram.total / (1024**3), 1),
        "percent": ram.percent,
        "model": "System RAM"
    }

@system_bp.route('/telemetry', methods=['GET'])
def get_telemetry():
    cpu_percent = psutil.cpu_percent(interval=0.1)
    
    # disk usage
    disk_usage = psutil.disk_usage('/')
    free_gb = disk_usage.free / (1024 ** 3)
    total_gb = disk_usage.total / (1024 ** 3)
    disk_percent = disk_usage.percent

    # cpu model
    cpu_model = get_cpu_model()
    
    # gpu info
    gpu_info = get_gpu_info()
    
    return jsonify({
        "status": "healthy",
        "cpu": {
            "load_percent": cpu_percent,
            "model": cpu_model
        },
        "vram": gpu_info,
        "disk": {
            "free_gb": round(free_gb, 1),
            "total_gb": round(total_gb, 1),
            "percent": disk_percent
        }
    })
