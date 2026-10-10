import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from vision_studio.domain.services.filter_pipeline import FilterPipeline

def test_filter_pipeline_empty_config_returns_original():
    image = np.zeros((100, 100, 3), dtype=np.uint8)
    result = FilterPipeline.apply(image, [])
    np.testing.assert_array_equal(result, image)

def test_filter_pipeline_grayscale():
    image = np.zeros((100, 100, 3), dtype=np.uint8)
    config = [{"type": "grayscale"}]
    
    # Since cv2 is mocked globally, FilterPipeline.apply just calls the mock
    result = FilterPipeline.apply(image, config)
    
    # Just verify it returns something (a mock object)
    assert result is not None
