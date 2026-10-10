from typing import List, Optional
from vision_studio.domain.entities.project import Project
from vision_studio.domain.ports.repositories import IProjectRepository

class ManageProjectUseCase:
    def __init__(self, project_repo: IProjectRepository):
        self.project_repo = project_repo
        
    def create_project(self, project: Project) -> Project:
        # Additional business logic, validation
        self.project_repo.save(project)
        return project
        
    def list_projects(self) -> List[Project]:
        return self.project_repo.list_all()
        
    def get_project(self, project_id: str) -> Optional[Project]:
        return self.project_repo.get_by_id(project_id)
        
    def update_project(self, project: Project) -> Project:
        self.project_repo.save(project)
        return project

    def delete_project(self, project_id: str) -> None:
        self.project_repo.delete(project_id)
