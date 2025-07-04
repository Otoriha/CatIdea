class Idea < ApplicationRecord
  belongs_to :user
  belongs_to :pain_point
  belongs_to :ai_conversation, optional: true

  validates :title, presence: true, length: { maximum: 200 }
  validates :description, presence: true
  validates :feasibility, presence: true, inclusion: { in: 1..5 }
  validates :impact, presence: true, inclusion: { in: 1..5 }
  validates :status, presence: true, inclusion: { 
    in: %w[draft validated in_progress completed] 
  }

  scope :by_status, ->(status) { where(status: status) }
  scope :ordered_by_created_at, ->(direction = :desc) { order(created_at: direction) }
  scope :high_impact, -> { where(impact: 4..5) }
  scope :high_feasibility, -> { where(feasibility: 4..5) }
  scope :promising, -> { high_impact.high_feasibility }

  def draft?
    status == 'draft'
  end

  def validated?
    status == 'validated'
  end

  def in_progress?
    status == 'in_progress'
  end

  def completed?
    status == 'completed'
  end

  def priority_score
    feasibility * impact
  end
end
