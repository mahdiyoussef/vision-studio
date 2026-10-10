from dataclasses import dataclass

@dataclass(frozen=True)
class ClassLabel:
    """Represents an object class label."""
    class_id: int
    name: str
