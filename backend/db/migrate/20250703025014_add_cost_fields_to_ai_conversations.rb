class AddCostFieldsToAiConversations < ActiveRecord::Migration[7.2]
  def change
    add_column :ai_conversations, :total_tokens, :integer, default: 0, null: false
    add_column :ai_conversations, :total_cost, :decimal, precision: 10, scale: 6, default: 0, null: false
    add_column :ai_conversations, :status, :integer, default: 0, null: false
    
    add_index :ai_conversations, :status
  end
end
