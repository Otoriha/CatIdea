class CreateJwtBlacklists < ActiveRecord::Migration[7.2]
  def change
    create_table :jwt_blacklists do |t|
      t.string :jti, null: false
      t.datetime :expires_at, null: false
      t.timestamps

      t.index :jti, unique: true
      t.index :expires_at
    end
  end
end