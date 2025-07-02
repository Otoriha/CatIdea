class Message < ApplicationRecord
  belongs_to :ai_conversation

  validates :sender_type, presence: true, inclusion: { in: %w[user ai] }
  validates :content, presence: true

  scope :ordered, -> { order(:created_at) }
  scope :by_sender, ->(type) { where(sender_type: type) }
end
