import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
};

type ProjectContextType = {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  refreshProjects: () => Promise<void>;
};

export const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  activeProjectId: null,
  setActiveProjectId: () => {},
  refreshProjects: async () => {}
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    return localStorage.getItem('visionStudio_activeProjectId') || null;
  });

  const refreshProjects = async () => {
    try {
      const data = await api.projects.list();
      setProjects(data);
      if (data.length > 0 && !activeProjectId) {
        setActiveProjectId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load projects for context", err);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('visionStudio_activeProjectId', activeProjectId);
    } else {
      localStorage.removeItem('visionStudio_activeProjectId');
    }
  }, [activeProjectId]);

  return (
    <ProjectContext.Provider value={{ projects, activeProjectId, setActiveProjectId, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

