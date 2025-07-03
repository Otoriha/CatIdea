class Api::V1::TagsController < ApplicationController
  before_action :require_login

  def index
    # ユーザーが使用しているタグのみを取得
    @tags = Tag.joins(pain_point_tags: :pain_point)
               .where(pain_points: { user_id: current_user.id })
               .distinct
               .order(:name)

    render json: {
      tags: @tags.map { |tag| tag_response(tag) }
    }
  end

  private

  def tag_response(tag)
    {
      id: tag.id,
      name: tag.name,
      pain_points_count: tag.pain_point_tags
                            .joins(:pain_point)
                            .where(pain_points: { user_id: current_user.id })
                            .count
    }
  end
end