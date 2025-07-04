class Api::V1::IdeasController < ApplicationController
  before_action :require_login
  before_action :set_pain_point, only: [:create]
  before_action :set_idea, only: [:show, :update, :destroy]

  def index
    @ideas = current_user.ideas
                         .includes(:pain_point, :ai_conversation)
                         .ordered_by_created_at

    # フィルタリング
    @ideas = @ideas.by_status(params[:status]) if params[:status].present?
    @ideas = @ideas.where(pain_point_id: params[:pain_point_id]) if params[:pain_point_id].present?
    
    # ソート
    case params[:sort]
    when 'impact'
      @ideas = @ideas.order(impact: :desc)
    when 'feasibility'
      @ideas = @ideas.order(feasibility: :desc)
    end

    # ページネーション（簡易実装）
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 20).to_i
    
    total_count = @ideas.count
    ideas_array = @ideas.offset((page - 1) * per_page).limit(per_page).to_a
    
    # priorityソートの場合は取得後にソート
    if params[:sort] == 'priority'
      ideas_array = ideas_array.sort_by(&:priority_score).reverse
    end

    render json: {
      ideas: ideas_array.map { |idea| idea_json(idea) },
      meta: {
        current_page: page,
        total_pages: (total_count.to_f / per_page).ceil,
        total_count: total_count,
        per_page: per_page
      }
    }
  end

  def show
    render json: { idea: idea_json(@idea, detailed: true) }
  end

  def create
    @idea = @pain_point.ideas.build(idea_params)
    @idea.user = current_user
    @idea.ai_conversation = @pain_point.ai_conversation if params[:from_conversation]

    if @idea.save
      render json: { idea: idea_json(@idea) }, status: :created
    else
      render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @idea.update(idea_params)
      render json: { idea: idea_json(@idea) }
    else
      render json: { errors: @idea.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @idea.destroy
    head :no_content
  end

  private

  def set_pain_point
    @pain_point = current_user.pain_points.find(params[:pain_point_id])
  end

  def set_idea
    @idea = current_user.ideas.find(params[:id])
  end

  def idea_params
    params.require(:idea).permit(:title, :description, :feasibility, :impact, :status)
  end

  def idea_json(idea, detailed: false)
    json = {
      id: idea.id,
      title: idea.title,
      description: idea.description,
      feasibility: idea.feasibility,
      impact: idea.impact,
      status: idea.status,
      priority_score: idea.priority_score,
      pain_point: {
        id: idea.pain_point.id,
        title: idea.pain_point.title
      },
      created_at: idea.created_at,
      updated_at: idea.updated_at
    }

    if detailed
      json[:pain_point] = {
        id: idea.pain_point.id,
        title: idea.pain_point.title,
        description: idea.pain_point.description,
        importance: idea.pain_point.importance,
        urgency: idea.pain_point.urgency
      }
      
      if idea.ai_conversation
        json[:ai_conversation] = {
          id: idea.ai_conversation.id,
          created_at: idea.ai_conversation.created_at
        }
      end
    end

    json
  end

end