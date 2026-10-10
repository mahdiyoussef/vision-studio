from abc import ABC, abstractmethod
from typing import BinaryIO

class IStorageAdapter(ABC):
    @abstractmethod
    def save_file(self, path: str, stream: BinaryIO) -> str:
        pass
        
    @abstractmethod
    def read_file(self, path: str) -> BinaryIO:
        pass
        
    @abstractmethod
    def delete_file(self, path: str) -> None:
        pass
