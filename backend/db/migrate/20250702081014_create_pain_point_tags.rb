class CreatePainPointTags < ActiveRecord::Migration[7.2]
  def change
    create_table :pain_point_tags do |t|
      t.references :pain_point, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true

      t.timestamps
    end

    add_index :pain_point_tags, [:pain_point_id, :tag_id], unique: true
  end
end
