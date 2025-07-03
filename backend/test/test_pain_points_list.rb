#!/usr/bin/env ruby
# ペインポイント一覧・検索・フィルタ機能のテストスクリプト

require 'net/http'
require 'json'
require 'uri'

BASE_URL = 'http://localhost:3000/api/v1'

def post_request(path, body = {}, token = nil)
  uri = URI("#{BASE_URL}#{path}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri)
  request['Content-Type'] = 'application/json'
  request['Authorization'] = "Bearer #{token}" if token
  request.body = body.to_json
  http.request(request)
end

def get_request(path, params = {}, token = nil)
  uri = URI("#{BASE_URL}#{path}")
  uri.query = URI.encode_www_form(params) if params.any?
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Get.new(uri)
  request['Authorization'] = "Bearer #{token}" if token
  http.request(request)
end

def patch_request(path, body = {}, token = nil)
  uri = URI("#{BASE_URL}#{path}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Patch.new(uri)
  request['Content-Type'] = 'application/json'
  request['Authorization'] = "Bearer #{token}" if token
  request.body = body.to_json
  http.request(request)
end

puts "=== ペインポイント一覧・検索・フィルタ機能テスト ==="

# 1. ユーザー登録とログイン
puts "\n1. ユーザー登録とログイン"
signup_response = post_request('/auth/signup', {
  user: {
    name: 'List Test User',
    email: "list_test_#{Time.now.to_i}@example.com",
    password: 'password123',
    password_confirmation: 'password123'
  }
})
puts "Signup Response: #{signup_response.code}"

login_response = post_request('/auth/login', {
  email: JSON.parse(signup_response.body)['user']['email'],
  password: 'password123'
})
puts "Login Response: #{login_response.code}"
token = JSON.parse(login_response.body)['token']

# 2. テスト用ペインポイントの作成
puts "\n2. テスト用ペインポイントの作成"
pain_points = [
  { title: '通勤電車の混雑', importance: 5, urgency: 4, tags: ['通勤', '電車'] },
  { title: 'アプリの起動が遅い', importance: 3, urgency: 2, tags: ['アプリ', 'パフォーマンス'] },
  { title: 'メール整理が大変', importance: 4, urgency: 5, tags: ['仕事', '効率化'] },
  { title: '家事の時間配分', importance: 2, urgency: 3, tags: ['家事', '時間管理'] },
  { title: 'ツールの使い勝手が悪い', importance: 4, urgency: 4, tags: ['ツール', 'UI/UX'] }
]

created_ids = []
pain_points.each do |pp|
  response = post_request('/pain_points', {
    pain_point: {
      title: pp[:title],
      description: "テスト用の説明文です。",
      importance: pp[:importance],
      urgency: pp[:urgency]
    },
    tags: pp[:tags]
  }, token)
  
  if response.code == '201'
    id = JSON.parse(response.body)['pain_point']['id']
    created_ids << id
    puts "Created: #{pp[:title]} (ID: #{id})"
  else
    puts "Failed to create: #{pp[:title]}"
    puts "Response: #{response.code} - #{response.body}"
  end
end

# 3. 一覧取得テスト
puts "\n3. 一覧取得テスト"
list_response = get_request('/pain_points', {}, token)
result = JSON.parse(list_response.body)
puts "Total count: #{result['pagination']['total_count']}"
puts "Current page: #{result['pagination']['current_page']}"
puts "Per page: #{result['pagination']['per_page']}"

# 4. 検索機能テスト
puts "\n4. 検索機能テスト"
search_response = get_request('/pain_points', { q: '電車' }, token)
search_result = JSON.parse(search_response.body)
puts "検索結果（'電車'）: #{search_result['pain_points'].count}件"
search_result['pain_points'].each do |pp|
  puts " - #{pp['title']}"
end

# 5. 重要度フィルタテスト
puts "\n5. 重要度フィルタテスト"
importance_response = get_request('/pain_points', { importance: 4 }, token)
importance_result = JSON.parse(importance_response.body)
puts "重要度4のペインポイント: #{importance_result['pain_points'].count}件"
importance_result['pain_points'].each do |pp|
  puts " - #{pp['title']} (重要度: #{pp['importance']})"
end

# 6. 緊急度フィルタテスト
puts "\n6. 緊急度フィルタテスト"
urgency_response = get_request('/pain_points', { urgency: 4 }, token)
urgency_result = JSON.parse(urgency_response.body)
puts "緊急度4のペインポイント: #{urgency_result['pain_points'].count}件"
urgency_result['pain_points'].each do |pp|
  puts " - #{pp['title']} (緊急度: #{pp['urgency']})"
end

# 7. タグフィルタテスト
puts "\n7. タグフィルタテスト"
# まずタグ一覧を取得
tags_response = get_request('/tags', {}, token)
tags = JSON.parse(tags_response.body)['tags']
puts "利用可能なタグ: #{tags.map { |t| t['name'] }.join(', ')}"

if tags.any?
  tag_id = tags.first['id']
  tag_filter_response = get_request('/pain_points', { tag_ids: tag_id }, token)
  tag_result = JSON.parse(tag_filter_response.body)
  puts "タグ '#{tags.first['name']}' のペインポイント: #{tag_result['pain_points'].count}件"
end

# 8. ソート機能テスト
puts "\n8. ソート機能テスト"
sort_tests = [
  { sort: 'importance_desc', label: '重要度（高い順）' },
  { sort: 'urgency_desc', label: '緊急度（高い順）' },
  { sort: 'created_at_asc', label: '作成日（古い順）' }
]

sort_tests.each do |test|
  sort_response = get_request('/pain_points', { sort: test[:sort], per_page: 3 }, token)
  sort_result = JSON.parse(sort_response.body)
  puts "\n#{test[:label]}:"
  sort_result['pain_points'].each do |pp|
    puts " - #{pp['title']} (重要度: #{pp['importance']}, 緊急度: #{pp['urgency']})"
  end
end

# 9. ページネーションテスト
puts "\n9. ページネーションテスト"
page1_response = get_request('/pain_points', { page: 1, per_page: 2 }, token)
page1_result = JSON.parse(page1_response.body)
puts "ページ1: #{page1_result['pain_points'].count}件"

page2_response = get_request('/pain_points', { page: 2, per_page: 2 }, token)
page2_result = JSON.parse(page2_response.body)
puts "ページ2: #{page2_result['pain_points'].count}件"
puts "総ページ数: #{page1_result['pagination']['total_pages']}"

# 10. 複合フィルタテスト
puts "\n10. 複合フィルタテスト"
complex_response = get_request('/pain_points', { 
  importance: 4,
  sort: 'urgency_desc'
}, token)
complex_result = JSON.parse(complex_response.body)
puts "重要度4 & 緊急度降順: #{complex_result['pain_points'].count}件"
complex_result['pain_points'].each do |pp|
  puts " - #{pp['title']} (重要度: #{pp['importance']}, 緊急度: #{pp['urgency']})"
end

puts "\n=== テスト完了 ==="