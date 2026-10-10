import pytest
from datetime import datetime
from vision_studio.domain.entities.project import Project, DomainConfig

def test_project_creation():
    config = DomainConfig(domain_name="test_stator")
    
    project = Project(
        id="proj_123",
        name="Stator Inspection",
        description="Test project",
        domain_config=config,
        created_at=datetime.utcnow()
    )
    
    assert project.id == "proj_123"
    assert project.name == "Stator Inspection"
    assert project.domain_config.domain_name == "test_stator"

