class User < ApplicationRecord
  has_secure_password

  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true,
                    format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { case_sensitive: false }

  has_many :pain_points, dependent: :destroy
  has_many :ai_conversations, dependent: :destroy
  has_many :api_usages, dependent: :destroy
  has_many :ideas, dependent: :destroy

  before_save { self.email = email.downcase }

  def monthly_api_cost
    api_usages.this_month.sum(:cost)
  end

  def monthly_token_usage
    api_usages.this_month.sum(:total_tokens)
  end

  def can_use_api?(cost_limit = 10.0)
    monthly_api_cost < cost_limit
  end
end
