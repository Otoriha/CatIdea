class RelatedPainPointsService
  def initialize(pain_point, user:)
    @pain_point = pain_point
    @user = user
  end

  def find_related(limit: 5)
    # 現在のペインポイントのタグIDを取得
    current_tag_ids = @pain_point.tag_ids
    
    # スコアリングのための重み
    tag_weight = 3.0
    importance_weight = 1.0
    urgency_weight = 1.0
    text_similarity_weight = 2.0
    
    # 同一ユーザーの他のペインポイントを取得
    other_pain_points = @user.pain_points
                             .includes(:tags)
                             .where.not(id: @pain_point.id)
    
    # 各ペインポイントのスコアを計算
    scored_pain_points = other_pain_points.map do |pain_point|
      score = 0.0
      
      # タグの一致度（共通タグ数 / 最大タグ数）
      if current_tag_ids.present? || pain_point.tag_ids.present?
        common_tags = (current_tag_ids & pain_point.tag_ids).size
        max_tags = [current_tag_ids.size, pain_point.tag_ids.size].max.to_f
        tag_similarity = max_tags > 0 ? common_tags / max_tags : 0
        score += tag_similarity * tag_weight
      end
      
      # 重要度の近さ（差分が小さいほど高スコア）
      importance_diff = (@pain_point.importance - pain_point.importance).abs
      importance_similarity = 1.0 - (importance_diff / 4.0)
      score += importance_similarity * importance_weight
      
      # 緊急度の近さ
      urgency_diff = (@pain_point.urgency - pain_point.urgency).abs
      urgency_similarity = 1.0 - (urgency_diff / 4.0)
      score += urgency_similarity * urgency_weight
      
      # テキストの類似度（簡易的な実装）
      text_similarity = calculate_text_similarity(@pain_point, pain_point)
      score += text_similarity * text_similarity_weight
      
      { pain_point: pain_point, score: score }
    end
    
    # スコアの高い順にソートして上位を返す
    scored_pain_points
      .sort_by { |item| -item[:score] }
      .first(limit)
      .select { |item| item[:score] > 0.5 } # 閾値以上のスコアのみ
      .map { |item| item[:pain_point] }
  end
  
  private
  
  def calculate_text_similarity(pain_point1, pain_point2)
    # タイトルと説明文を結合
    text1 = "#{pain_point1.title} #{pain_point1.description}".downcase
    text2 = "#{pain_point2.title} #{pain_point2.description}".downcase
    
    # 単語に分割（簡易的な実装）
    words1 = text1.split(/\s+/).uniq
    words2 = text2.split(/\s+/).uniq
    
    # Jaccard係数で類似度を計算
    intersection = (words1 & words2).size
    union = (words1 | words2).size
    
    union > 0 ? intersection.to_f / union : 0
  end
end