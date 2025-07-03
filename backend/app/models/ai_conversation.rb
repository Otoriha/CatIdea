class AiConversation < ApplicationRecord
  belongs_to :user
  belongs_to :pain_point

  validates :pain_point_id, uniqueness: true

  has_many :messages, dependent: :destroy

  enum status: {
    active: 0,
    completed: 1,
    error: 2,
    cost_limit_reached: 3
  }

  scope :active_conversations, -> { where(status: :active) }

  def add_message(sender_type, content, input_tokens: 0, output_tokens: 0)
    messages.create!(
      sender_type: sender_type,
      content: content,
      input_tokens: input_tokens,
      output_tokens: output_tokens
    )

    # Update conversation totals
    update!(
      total_tokens: total_tokens + input_tokens + output_tokens,
      total_cost: calculate_total_cost
    )
  end

  def calculate_total_cost
    # Cost calculation based on model pricing
    # gpt-4.1-nano: $0.15 / 1M input tokens, $0.60 / 1M output tokens
    input_cost = messages.sum(:input_tokens) * 0.00000015
    output_cost = messages.sum(:output_tokens) * 0.00000060
    input_cost + output_cost
  end
end
