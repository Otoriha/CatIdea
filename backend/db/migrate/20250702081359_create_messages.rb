class CreateMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :messages do |t|
      t.references :ai_conversation, null: false, foreign_key: true
      t.string :sender_type, null: false
      t.text :content, null: false

      t.timestamps
    end

    add_index :messages, [:ai_conversation_id, :created_at]
  end
end
