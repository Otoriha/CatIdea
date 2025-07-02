class AddImportanceToPainPoints < ActiveRecord::Migration[7.2]
  def change
    add_column :pain_points, :importance, :integer, default: 3
  end
end
