class CreateAiConversations < ActiveRecord::Migration[7.2]
  def change
    create_table :ai_conversations do |t|
      t.references :user, null: false, foreign_key: true
      t.references :pain_point, null: false, foreign_key: true

      t.timestamps
    end

    add_index :ai_conversations, :pain_point_id, unique: true, name: 'index_ai_conversations_on_pain_point_id_unique'
  end
end
