class Api::V1::PainPointsController < ApplicationController
  before_action :require_login
  before_action :set_pain_point, only: [:show, :update, :destroy, :related]

  def index
    @pain_points = current_user.pain_points.includes(:tags)
    
    # 検索機能
    @pain_points = @pain_points.search(params[:q]) if params[:q].present?
    
    # タグフィルタ
    if params[:tag_ids].present?
      tag_ids = params[:tag_ids].is_a?(String) ? params[:tag_ids].split(',') : params[:tag_ids]
      @pain_points = @pain_points.by_tags(tag_ids)
    end
    
    # 重要度フィルタ
    @pain_points = @pain_points.by_importance(params[:importance]) if params[:importance].present?
    
    # 緊急度フィルタ
    @pain_points = @pain_points.by_urgency(params[:urgency]) if params[:urgency].present?
    
    # ソート機能
    @pain_points = case params[:sort]
                   when 'created_at_asc'
                     @pain_points.ordered_by_created_at(:asc)
                   when 'created_at_desc'
                     @pain_points.ordered_by_created_at(:desc)
                   when 'importance_asc'
                     @pain_points.ordered_by_importance(:asc)
                   when 'importance_desc'
                     @pain_points.ordered_by_importance(:desc)
                   when 'urgency_asc'
                     @pain_points.order(urgency: :asc)
                   when 'urgency_desc'
                     @pain_points.order(urgency: :desc)
                   else
                     @pain_points.ordered_by_created_at(:desc)
                   end

    # 総件数を取得（ページネーション前）
    total_count = @pain_points.count

    # ページネーション
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    per_page = [per_page, 50].min # 最大50件まで

    @pain_points = @pain_points.limit(per_page).offset((page - 1) * per_page)

    render json: {
      pain_points: @pain_points.map { |pain_point| pain_point_response(pain_point) },
      pagination: {
        current_page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: (total_count / per_page.to_f).ceil
      }
    }
  end

  def show
    render json: {
      pain_point: pain_point_response(@pain_point)
    }
  end

  def create
    @pain_point = current_user.pain_points.build(pain_point_params)
    
    if @pain_point.save
      # タグの関連付け
      attach_tags(@pain_point, params[:tags]) if params[:tags].present?
      
      render json: {
        message: 'ペインポイントを作成しました',
        pain_point: pain_point_response(@pain_point)
      }, status: :created
    else
      render json: {
        message: 'ペインポイントの作成に失敗しました',
        errors: @pain_point.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    if @pain_point.update(pain_point_params)
      # タグの更新
      if params[:tags].present?
        @pain_point.pain_point_tags.destroy_all
        attach_tags(@pain_point, params[:tags])
      end
      
      render json: {
        message: 'ペインポイントを更新しました',
        pain_point: pain_point_response(@pain_point)
      }
    else
      render json: {
        message: 'ペインポイントの更新に失敗しました',
        errors: @pain_point.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @pain_point.destroy
    render json: {
      message: 'ペインポイントを削除しました'
    }
  end

  def quick_create
    if params[:content].blank?
      return render json: {
        error: 'コンテンツを入力してください'
      }, status: :unprocessable_entity
    end
    
    @pain_point = current_user.pain_points.build(
      title: params[:content],
      importance: 3 # デフォルト値
    )
    
    if @pain_point.save
      render json: {
        message: 'ペインポイントをクイック作成しました',
        pain_point: pain_point_response(@pain_point)
      }, status: :created
    else
      render json: {
        message: 'ペインポイントの作成に失敗しました',
        errors: @pain_point.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def related
    service = RelatedPainPointsService.new(@pain_point, user: current_user)
    related_pain_points = service.find_related(limit: params[:limit] || 5)
    
    render json: {
      related_pain_points: related_pain_points.map { |pp| pain_point_response(pp) }
    }
  end

  private

  def set_pain_point
    @pain_point = current_user.pain_points.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      message: 'ペインポイントが見つかりません'
    }, status: :not_found
  end

  def pain_point_params
    params.require(:pain_point).permit(:title, :description, :importance, :urgency, images: [])
  end

  def pain_point_response(pain_point)
    {
      id: pain_point.id,
      title: pain_point.title,
      description: pain_point.description,
      importance: pain_point.importance,
      urgency: pain_point.urgency,
      tags: pain_point.tags.map { |tag| { id: tag.id, name: tag.name } },
      images: pain_point.images.attached? ? pain_point.images.map { |image| rails_blob_url(image) } : [],
      created_at: pain_point.created_at,
      updated_at: pain_point.updated_at
    }
  end

  def attach_tags(pain_point, tag_names)
    tag_names.each do |tag_name|
      tag = Tag.find_or_create_by(name: tag_name.downcase)
      pain_point.pain_point_tags.find_or_create_by(tag: tag)
    end
  end
end
