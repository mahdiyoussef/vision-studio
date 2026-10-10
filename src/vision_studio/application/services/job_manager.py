import uuid
import threading
import time

class JobManager:
    def __init__(self):
        self.jobs = {}
        
    def submit(self, name, func, *args, **kwargs):
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "id": job_id,
            "name": name,
            "status": "pending",
            "progress": 0,
            "message": "Initializing...",
            "result": None,
            "error": None
        }
        
        def run_job():
            self.update_job(job_id, status="running", message="Starting task...")
            try:
                # Force inject the correct job_id so the function can report progress
                kwargs['job_id'] = job_id
                result = func(*args, **kwargs)
                self.update_job(job_id, status="completed", progress=100, message="Completed successfully", result=result)
            except Exception as e:
                self.update_job(job_id, status="failed", message=str(e), error=str(e))
                
        thread = threading.Thread(target=run_job)
        thread.start()
        return job_id
        
    def update_job(self, job_id, status=None, progress=None, message=None, result=None, error=None):
        if job_id in self.jobs:
            if status: self.jobs[job_id]["status"] = status
            if progress is not None: self.jobs[job_id]["progress"] = progress
            if message: self.jobs[job_id]["message"] = message
            if result: self.jobs[job_id]["result"] = result
            if error: self.jobs[job_id]["error"] = error
            
    def get_job(self, job_id):
        return self.jobs.get(job_id)

job_manager = JobManager()
