class PainPoint < ApplicationRecord
  belongs_to :user
  
  validates :title, presence: true, length: { maximum: 200 }
  validates :importance, presence: true, inclusion: { in: 1..5 }
  
  has_many :pain_point_tags, dependent: :destroy
  has_many :tags, through: :pain_point_tags
  has_one :ai_conversation, dependent: :destroy
  has_many_attached :images

  scope :by_importance, ->(importance) { where(importance: importance) }
  scope :ordered_by_created_at, ->(direction = :desc) { order(created_at: direction) }
  scope :ordered_by_importance, ->(direction = :desc) { order(importance: direction) }
end
