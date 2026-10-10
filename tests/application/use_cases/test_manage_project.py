import pytest
from vision_studio.application.use_cases.manage_project import ManageProjectUseCase
from vision_studio.domain.entities.project import Project, DomainConfig
import uuid

class MockProjectRepository:
    def __init__(self):
        self.projects = {}
        
    def save(self, project: Project) -> None:
        self.projects[project.id] = project
        
    def get_by_id(self, project_id: str) -> Project | None:
        return self.projects.get(project_id)
        
    def list_all(self):
        return list(self.projects.values())
        
    def delete(self, project_id: str) -> None:
        if project_id in self.projects:
            del self.projects[project_id]

def test_create_project(dummy_project):
    repo = MockProjectRepository()
    use_case = ManageProjectUseCase(project_repo=repo)
    
    use_case.create_project(dummy_project)
    
    assert dummy_project.id in repo.projects
    assert repo.projects[dummy_project.id].name == "Test Project"

def test_get_project(dummy_project):
    repo = MockProjectRepository()
    repo.save(dummy_project)
    
    use_case = ManageProjectUseCase(project_repo=repo)
    
    fetched = use_case.get_project(dummy_project.id)
    assert fetched is not None
    assert fetched.id == dummy_project.id

def test_delete(dummy_project):
    repo = MockProjectRepository()
    repo.save(dummy_project)
    
    use_case = ManageProjectUseCase(project_repo=repo)
    
    use_case.delete_project(dummy_project.id)
    assert dummy_project.id not in repo.projects
