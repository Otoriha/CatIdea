# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_07_03_113341) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "ai_conversations", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "pain_point_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "total_tokens", default: 0, null: false
    t.decimal "total_cost", precision: 10, scale: 6, default: "0.0", null: false
    t.integer "status", default: 0, null: false
    t.index ["pain_point_id"], name: "index_ai_conversations_on_pain_point_id"
    t.index ["pain_point_id"], name: "index_ai_conversations_on_pain_point_id_unique", unique: true
    t.index ["status"], name: "index_ai_conversations_on_status"
    t.index ["user_id"], name: "index_ai_conversations_on_user_id"
  end

  create_table "api_usages", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "ai_model", null: false
    t.integer "input_tokens", default: 0, null: false
    t.integer "output_tokens", default: 0, null: false
    t.integer "total_tokens", default: 0, null: false
    t.decimal "cost", precision: 10, scale: 6, default: "0.0", null: false
    t.string "request_type", null: false
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ai_model"], name: "index_api_usages_on_ai_model"
    t.index ["user_id", "created_at"], name: "index_api_usages_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_api_usages_on_user_id"
  end

  create_table "jwt_blacklists", force: :cascade do |t|
    t.string "jti", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_jwt_blacklists_on_expires_at"
    t.index ["jti"], name: "index_jwt_blacklists_on_jti", unique: true
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "ai_conversation_id", null: false
    t.string "sender_type", null: false
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "input_tokens", default: 0, null: false
    t.integer "output_tokens", default: 0, null: false
    t.index ["ai_conversation_id", "created_at"], name: "index_messages_on_ai_conversation_id_and_created_at"
    t.index ["ai_conversation_id"], name: "index_messages_on_ai_conversation_id"
  end

  create_table "pain_point_tags", force: :cascade do |t|
    t.bigint "pain_point_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pain_point_id", "tag_id"], name: "index_pain_point_tags_on_pain_point_id_and_tag_id", unique: true
    t.index ["pain_point_id"], name: "index_pain_point_tags_on_pain_point_id"
    t.index ["tag_id"], name: "index_pain_point_tags_on_tag_id"
  end

  create_table "pain_points", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "importance", default: 3
    t.index ["user_id"], name: "index_pain_points_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "github_uid"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["github_uid"], name: "index_users_on_github_uid", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "ai_conversations", "pain_points"
  add_foreign_key "ai_conversations", "users"
  add_foreign_key "api_usages", "users"
  add_foreign_key "messages", "ai_conversations"
  add_foreign_key "pain_point_tags", "pain_points"
  add_foreign_key "pain_point_tags", "tags"
  add_foreign_key "pain_points", "users"
end
