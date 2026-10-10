from dataclasses import dataclass, field
from datetime import datetime
from typing import List
from .domain_config import DomainConfig
from .calibration_profile import CalibrationProfile

@dataclass
class Project:
    id: str
    name: str
    description: str
    domain_config: DomainConfig
    status: str = "Paused"
    calibration_profiles: List[CalibrationProfile] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
