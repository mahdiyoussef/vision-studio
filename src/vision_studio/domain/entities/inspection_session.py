from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from enum import Enum, auto

class SessionState(Enum):
    PENDING = auto()
    RUNNING = auto()
    PAUSED = auto()
    COMPLETED = auto()
    CANCELLED = auto()

@dataclass
class InspectionSession:
    id: str
    project_id: str
    state: SessionState = SessionState.PENDING
    current_stage: str = "initial"
    created_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    def start(self) -> None:
        self.state = SessionState.RUNNING

    def pause(self) -> None:
        if self.state == SessionState.RUNNING:
            self.state = SessionState.PAUSED

    def resume(self) -> None:
        if self.state == SessionState.PAUSED:
            self.state = SessionState.RUNNING

    def complete(self) -> None:
        self.state = SessionState.COMPLETED
        self.completed_at = datetime.utcnow()

    def cancel(self) -> None:
        self.state = SessionState.CANCELLED
