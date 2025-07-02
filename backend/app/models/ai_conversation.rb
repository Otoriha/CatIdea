class AiConversation < ApplicationRecord
  belongs_to :user
  belongs_to :pain_point

  validates :pain_point_id, uniqueness: true

  has_many :messages, dependent: :destroy
end
