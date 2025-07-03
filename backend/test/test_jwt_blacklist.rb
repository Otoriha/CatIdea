#!/usr/bin/env ruby
# JWT ブラックリスト機能のテストスクリプト

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

def get_request(path, token = nil)
  uri = URI("#{BASE_URL}#{path}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Get.new(uri)
  request['Authorization'] = "Bearer #{token}" if token
  http.request(request)
end

def delete_request(path, token = nil)
  uri = URI("#{BASE_URL}#{path}")
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Delete.new(uri)
  request['Authorization'] = "Bearer #{token}" if token
  http.request(request)
end

puts "=== JWT ブラックリスト機能テスト ==="

# 1. 新規ユーザー登録
puts "\n1. 新規ユーザー登録"
signup_response = post_request('/auth/signup', {
  user: {
    name: 'Test User',
    email: "test_#{Time.now.to_i}@example.com",
    password: 'password123',
    password_confirmation: 'password123'
  }
})
puts "Response: #{signup_response.code}"
puts "Body: #{signup_response.body}"

# 2. ログイン（JWT取得）
puts "\n2. ログイン（JWT取得）"
login_data = JSON.parse(signup_response.body)
login_response = post_request('/auth/login', {
  email: login_data['user']['email'],
  password: 'password123'
})
puts "Response: #{login_response.code}"
login_result = JSON.parse(login_response.body)
puts "Token: #{login_result['token']}"
token = login_result['token']

# 3. JWT認証でAPIアクセス（ログアウト前）
puts "\n3. JWT認証でAPIアクセス（ログアウト前）"
api_response = get_request('/pain_points', token)
puts "Response: #{api_response.code}"
puts "Authorized: #{api_response.code == '200'}"

# 4. ログアウト（JWTをブラックリストに追加）
puts "\n4. ログアウト（JWTをブラックリストに追加）"
logout_response = delete_request('/auth/logout', token)
puts "Response: #{logout_response.code}"
puts "Body: #{logout_response.body}"

# 5. JWT認証でAPIアクセス（ログアウト後）
puts "\n5. JWT認証でAPIアクセス（ログアウト後）"
api_response_after = get_request('/pain_points', token)
puts "Response: #{api_response_after.code}"
puts "Authorized: #{api_response_after.code == '200'}"
puts "Expected: 401 (Unauthorized)"

# 6. テスト結果
puts "\n=== テスト結果 ==="
if api_response_after.code == '401'
  puts "✅ 成功: ログアウト後、JWTトークンが無効化されました"
else
  puts "❌ 失敗: ログアウト後もJWTトークンが有効です"
end