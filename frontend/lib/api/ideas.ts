import { apiClient } from './client'

export interface Idea {
  id: number
  title: string
  description: string
  feasibility: number
  impact: number
  status: 'draft' | 'validated' | 'in_progress' | 'completed'
  priority_score: number
  pain_point: {
    id: number
    title: string
    description?: string
    importance?: number
    urgency?: number
  }
  ai_conversation?: {
    id: number
    created_at: string
  }
  created_at: string
  updated_at: string
}

export interface CreateIdeaInput {
  title: string
  description: string
  feasibility: number
  impact: number
  status?: 'draft' | 'validated' | 'in_progress' | 'completed'
  from_conversation?: boolean
}

export interface UpdateIdeaInput {
  title?: string
  description?: string
  feasibility?: number
  impact?: number
  status?: 'draft' | 'validated' | 'in_progress' | 'completed'
}

export interface IdeasResponse {
  ideas: Idea[]
  meta: {
    current_page: number
    total_pages: number
    total_count: number
    per_page: number
  }
}

export const ideasApi = {
  async getIdeas(params?: {
    page?: number
    per_page?: number
    status?: string
    pain_point_id?: number
    sort?: 'priority' | 'impact' | 'feasibility'
  }): Promise<IdeasResponse> {
    const response = await apiClient.get<IdeasResponse>('/ideas', { params })
    return response.data
  },

  async getIdea(id: number): Promise<{ idea: Idea }> {
    const response = await apiClient.get<{ idea: Idea }>(`/ideas/${id}`)
    return response.data
  },

  async createIdea(painPointId: number, data: CreateIdeaInput): Promise<{ idea: Idea }> {
    const response = await apiClient.post<{ idea: Idea }>(
      `/pain_points/${painPointId}/ideas`,
      { idea: data }
    )
    return response.data
  },

  async updateIdea(id: number, data: UpdateIdeaInput): Promise<{ idea: Idea }> {
    const response = await apiClient.patch<{ idea: Idea }>(
      `/ideas/${id}`,
      { idea: data }
    )
    return response.data
  },

  async deleteIdea(id: number): Promise<void> {
    await apiClient.delete(`/ideas/${id}`)
  },
}