class AddUrgencyToPainPoints < ActiveRecord::Migration[7.2]
  def change
    add_column :pain_points, :urgency, :integer, default: 3, null: false
    add_index :pain_points, :urgency
  end
end
