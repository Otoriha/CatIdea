# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# 本番環境ではサンプルデータを作成しない
if Rails.env.development? || ENV['SEED_SAMPLE_DATA'] == 'true'
  puts "Creating sample data for #{Rails.env} environment..."

  # Create sample users
user1 = User.find_or_create_by!(email: "tanaka@example.com") do |user|
  user.name = "田中太郎"
  user.password = "password123"
end

user2 = User.find_or_create_by!(email: "sato@example.com") do |user|
  user.name = "佐藤花子"
  user.password = "password123"
end

# Create sample tags
tag_work = Tag.find_or_create_by!(name: "業務")
tag_life = Tag.find_or_create_by!(name: "私生活")
tag_ui = Tag.find_or_create_by!(name: "uiux")
tag_commute = Tag.find_or_create_by!(name: "移動中")
tag_app = Tag.find_or_create_by!(name: "アプリ")

# Create sample pain points
pain1 = PainPoint.find_or_create_by!(
  user: user1,
  title: "電車の遅延情報が分からない"
) do |pain|
  pain.description = "朝の通勤時に電車が遅れているのに、正確な遅延時間が分からずイライラする。リアルタイムの情報が欲しい。"
end

pain2 = PainPoint.find_or_create_by!(
  user: user1,
  title: "会議の資料共有が面倒"
) do |pain|
  pain.description = "毎回会議前に資料をメールで送るのが手間。クラウドで簡単に共有できるシステムがあればいいのに。"
end

pain3 = PainPoint.find_or_create_by!(
  user: user2,
  title: "家計簿をつけるのが続かない"
) do |pain|
  pain.description = "レシートを撮影するだけで自動で家計簿がつけられるアプリがあれば続けられそう。手入力は面倒で挫折してしまう。"
end

pain4 = PainPoint.find_or_create_by!(
  user: user2,
  title: "スマホの容量不足"
) do |pain|
  pain.description = "写真がたくさんあってスマホの容量がすぐにいっぱいになる。不要な写真を簡単に見つけて削除できる機能が欲しい。"
end

# Add tags to pain points (only if not already associated)
unless pain1.tags.include?(tag_commute)
  pain1.tags << [tag_commute, tag_app].reject { |tag| pain1.tags.include?(tag) }
end

unless pain2.tags.include?(tag_work)
  pain2.tags << [tag_work, tag_ui].reject { |tag| pain2.tags.include?(tag) }
end

unless pain3.tags.include?(tag_life)
  pain3.tags << [tag_life, tag_app].reject { |tag| pain3.tags.include?(tag) }
end

unless pain4.tags.include?(tag_life)
  pain4.tags << [tag_life, tag_ui].reject { |tag| pain4.tags.include?(tag) }
end

  puts "Created #{User.count} users"
  puts "Created #{Tag.count} tags"
  puts "Created #{PainPoint.count} pain points"
  puts "Created #{PainPointTag.count} pain point tags"
else
  puts "Skipping sample data creation in #{Rails.env} environment"
end
