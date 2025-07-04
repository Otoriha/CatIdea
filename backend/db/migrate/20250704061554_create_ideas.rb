class CreateIdeas < ActiveRecord::Migration[7.2]
  def change
    create_table :ideas do |t|
      t.references :user, null: false, foreign_key: true
      t.references :pain_point, null: false, foreign_key: true
      t.references :ai_conversation, foreign_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.integer :feasibility, default: 3, null: false
      t.integer :impact, default: 3, null: false
      t.string :status, default: 'draft', null: false

      t.timestamps
    end

    add_index :ideas, :status
    add_index :ideas, [:user_id, :created_at]
    add_index :ideas, [:pain_point_id, :created_at]
  end
end
