import { API_BASE_URL } from '@/config/env';

// Experience interfaces
export interface ExperiencePayload {
  title: string;
  company: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  location: string;
  is_current: boolean;
  tools: string[];
}

export interface ExperienceResponse {
  message: string;
  data: any;
  success: boolean;
}

// Education interfaces
export interface EducationPayload {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
  description: string;
}

export interface EducationResponse {
  message: string;
  data: any;
  success: boolean;
}

// Achievement interfaces
export interface AchievementPayload {
  title: string;
  description: string;
  date_awarded: string;
  link?: string;
}

export interface AchievementResponse {
  message: string;
  data: any;
  success: boolean;
}

export interface DeletePayload {
  index: string;
}

export interface DeleteResponse {
  message: string;
  success: boolean;
}

class ProfileApiService {
  // Experience methods
  async addExperience(data: ExperiencePayload): Promise<ExperienceResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/experience`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Add experience error:', error);
      throw error;
    }
  }

  async deleteExperience(data: DeletePayload): Promise<DeleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/experience`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete experience error:', error);
      throw error;
    }
  }

  // Education methods
  async addEducation(data: EducationPayload): Promise<EducationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/education`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Add education error:', error);
      throw error;
    }
  }

  async deleteEducation(data: DeletePayload): Promise<DeleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/education`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete education error:', error);
      throw error;
    }
  }

  // Achievement methods
  async addAchievement(data: AchievementPayload): Promise<AchievementResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/achievement`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Add achievement error:', error);
      throw error;
    }
  }

  async deleteAchievement(data: DeletePayload): Promise<DeleteResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/achievement`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete achievement error:', error);
      throw error;
    }
  }
}

export const profileApiService = new ProfileApiService();
