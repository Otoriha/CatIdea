class User < ApplicationRecord
  has_secure_password

  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true, 
                    format: { with: URI::MailTo::EMAIL_REGEXP },
                    uniqueness: { case_sensitive: false }

  has_many :pain_points, dependent: :destroy
  has_many :ai_conversations, dependent: :destroy

  before_save { self.email = email.downcase }
end
