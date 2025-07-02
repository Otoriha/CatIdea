class PainPoint < ApplicationRecord
  belongs_to :user
  
  validates :title, presence: true, length: { maximum: 200 }
  
  has_many :pain_point_tags, dependent: :destroy
  has_many :tags, through: :pain_point_tags
  has_one :ai_conversation, dependent: :destroy
  has_many_attached :images
end
