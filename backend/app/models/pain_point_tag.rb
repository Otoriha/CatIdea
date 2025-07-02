class PainPointTag < ApplicationRecord
  belongs_to :pain_point
  belongs_to :tag

  validates :pain_point_id, uniqueness: { scope: :tag_id }
end