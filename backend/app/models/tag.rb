class Tag < ApplicationRecord
  validates :name, presence: true, 
                   length: { maximum: 50 },
                   uniqueness: { case_sensitive: false }

  has_many :pain_point_tags, dependent: :destroy
  has_many :pain_points, through: :pain_point_tags

  before_save { self.name = name.downcase }
end
