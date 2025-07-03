class AddTokenFieldsToMessages < ActiveRecord::Migration[7.2]
  def change
    add_column :messages, :input_tokens, :integer, default: 0, null: false
    add_column :messages, :output_tokens, :integer, default: 0, null: false
  end
end
