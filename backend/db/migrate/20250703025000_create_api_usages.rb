class CreateApiUsages < ActiveRecord::Migration[7.2]
  def change
    create_table :api_usages do |t|
      t.references :user, null: false, foreign_key: true
      t.string :ai_model, null: false
      t.integer :input_tokens, null: false, default: 0
      t.integer :output_tokens, null: false, default: 0
      t.integer :total_tokens, null: false, default: 0
      t.decimal :cost, precision: 10, scale: 6, null: false, default: 0
      t.string :request_type, null: false
      t.jsonb :metadata, default: {}

      t.timestamps
    end
    
    add_index :api_usages, [:user_id, :created_at]
    add_index :api_usages, :ai_model
  end
end
