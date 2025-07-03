class ApiUsage < ApplicationRecord
  belongs_to :user

  validates :ai_model, presence: true
  validates :request_type, presence: true
  validates :input_tokens, numericality: { greater_than_or_equal_to: 0 }
  validates :output_tokens, numericality: { greater_than_or_equal_to: 0 }
  validates :total_tokens, numericality: { greater_than_or_equal_to: 0 }
  validates :cost, numericality: { greater_than_or_equal_to: 0 }

  REQUEST_TYPES = %w[conversation deepening_questions].freeze

  validates :request_type, inclusion: { in: REQUEST_TYPES }

  scope :recent, -> { order(created_at: :desc) }
  scope :by_model, ->(model) { where(ai_model: model) }
  scope :this_month, -> { where(created_at: Time.current.beginning_of_month..Time.current.end_of_month) }

  def self.calculate_cost(model, input_tokens, output_tokens)
    case model
    when "gpt-4.1-nano"
      # $0.15 / 1M input tokens, $0.60 / 1M output tokens
      (input_tokens * 0.00000015) + (output_tokens * 0.00000060)
    else
      # Default pricing for other models
      (input_tokens * 0.000002) + (output_tokens * 0.000002)
    end
  end

  def self.track_usage(user:, model:, request_type:, input_tokens:, output_tokens:, metadata: {})
    total = input_tokens + output_tokens
    cost = calculate_cost(model, input_tokens, output_tokens)

    create!(
      user: user,
      ai_model: model,
      request_type: request_type,
      input_tokens: input_tokens,
      output_tokens: output_tokens,
      total_tokens: total,
      cost: cost,
      metadata: metadata
    )
  end
end
