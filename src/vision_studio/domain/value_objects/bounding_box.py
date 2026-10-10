from dataclasses import dataclass

@dataclass(frozen=True)
class BoundingBox:
    """Represents an immutable axis-aligned bounding box."""
    x: float
    y: float
    w: float
    h: float

    def __post_init__(self) -> None:
        if self.w < 0 or self.h < 0:
            raise ValueError("BoundingBox dimensions must be non-negative")

    @property
    def x_center(self) -> float:
        return self.x + self.w / 2.0

    @property
    def y_center(self) -> float:
        return self.y + self.h / 2.0

    @property
    def area(self) -> float:
        return self.w * self.h

