from dataclasses import dataclass

@dataclass(frozen=True)
class PhysicalDimension:
    """Represents a physical measurement with units."""
    value: float
    unit: str = "mm"

    def __str__(self) -> str:
        return f"{self.value:.3f} {self.unit}"
