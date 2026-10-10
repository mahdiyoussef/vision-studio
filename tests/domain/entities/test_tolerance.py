import pytest
from vision_studio.domain.value_objects.tolerance import ToleranceBand, ToleranceStatus

def test_tolerance_within_bounds():
    tol = ToleranceBand(nominal=100.0, upper=105.0, lower=95.0)
    
    # Exact nominal
    assert tol.check(100.0) == ToleranceStatus.PASS
    
    # On the boundary
    assert tol.check(105.0) == ToleranceStatus.PASS
    assert tol.check(95.0) == ToleranceStatus.PASS
    
    # Inside bounds
    assert tol.check(102.5) == ToleranceStatus.PASS

def test_tolerance_outside_bounds():
    tol = ToleranceBand(nominal=100.0, upper=105.0, lower=95.0)
    
    # Outside bounds
    assert tol.check(105.1) == ToleranceStatus.FAIL
    assert tol.check(94.9) == ToleranceStatus.FAIL

def test_tolerance_invalid_bounds():
    with pytest.raises(ValueError):
        ToleranceBand(nominal=100.0, upper=90.0, lower=105.0)
