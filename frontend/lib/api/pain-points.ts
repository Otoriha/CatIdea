import { apiClient } from '../api-client'

export interface PainPoint {
  id: number
  title: string
  description?: string
  importance: number
  urgency: number
  tags: Array<{ id: number; name: string }>
  created_at: string
  updated_at: string
}

export const painPointsApi = {
  async getRelatedPainPoints(id: string, limit?: number): Promise<{ related_pain_points: PainPoint[] }> {
    const response = await apiClient.get(`/pain_points/${id}/related`, {
      params: { limit }
    })
    return response.data
  }
}