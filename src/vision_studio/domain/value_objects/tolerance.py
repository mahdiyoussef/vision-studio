from dataclasses import dataclass
from enum import Enum, auto

class ToleranceStatus(Enum):
    PASS = auto()
    WARNING = auto()
    FAIL = auto()

@dataclass(frozen=True)
class ToleranceBand:
    """Defines a tolerance band for a measurement."""
    nominal: float
    lower: float
    upper: float
    unit: str = "mm"

    def __post_init__(self) -> None:
        if self.lower > self.upper:
            raise ValueError("Lower bound cannot be greater than upper bound")

    def check(self, measured_value: float) -> ToleranceStatus:
        if self.lower <= measured_value <= self.upper:
            return ToleranceStatus.PASS
        # Extend with warning thresholds if necessary
        return ToleranceStatus.FAIL
