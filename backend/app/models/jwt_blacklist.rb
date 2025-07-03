class JwtBlacklist < ApplicationRecord
  validates :jti, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where('expires_at > ?', Time.current) }
  scope :expired, -> { where('expires_at <= ?', Time.current) }

  def self.cleanup_expired
    expired.destroy_all
  end

  def active?
    expires_at > Time.current
  end
end