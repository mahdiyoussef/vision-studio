import numpy as np
import cv2
from typing import List, Dict, Any

class FilterPipeline:
    """
    Applies a sequence of image processing filters (e.g. blur, contrast, edge detection)
    defined in a configuration dictionary.
    """
    
    @staticmethod
    def apply(image: np.ndarray, config: List[Dict[str, Any]]) -> np.ndarray:
        if not config:
            return image
            
        result = image.copy()
        
        for step in config:
            filter_type = step.get("type")
            params = step.get("params", {})
            
            if filter_type == "gaussian_blur":
                ksize = params.get("ksize", 5)
                result = cv2.GaussianBlur(result, (ksize, ksize), 0)
                
            elif filter_type == "median_blur":
                ksize = params.get("ksize", 5)
                result = cv2.MedianBlur(result, ksize)
                
            elif filter_type == "grayscale":
                if len(result.shape) == 3:
                    result = cv2.cvtColor(result, cv2.COLOR_BGR2GRAY)
                    
            elif filter_type == "threshold":
                thresh = params.get("thresh", 127)
                maxval = params.get("maxval", 255)
                method = params.get("method", cv2.THRESH_BINARY)
                _, result = cv2.threshold(result, thresh, maxval, method)
                
            elif filter_type == "canny":
                threshold1 = params.get("threshold1", 100)
                threshold2 = params.get("threshold2", 200)
                result = cv2.Canny(result, threshold1, threshold2)
                
            # Add more generic filters as needed
            
        return result
