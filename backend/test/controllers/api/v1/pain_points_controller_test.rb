require "test_helper"

class Api::V1::PainPointsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = User.create!(
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    )
    
    # ログインしてトークンを取得
    post api_v1_auth_login_path, params: { email: @user.email, password: 'password123' }
    @token = JSON.parse(response.body)['token']
    @headers = { 'Authorization' => "Bearer #{@token}" }
  end

  test "should quick create pain point with valid content" do
    assert_difference('PainPoint.count', 1) do
      post api_v1_pain_points_quick_path, 
        params: { content: '通勤電車が混雑していて不快' },
        headers: @headers
    end

    assert_response :created
    json_response = JSON.parse(response.body)
    assert_equal 'ペインポイントをクイック作成しました', json_response['message']
    assert_equal '通勤電車が混雑していて不快', json_response['pain_point']['title']
    assert_equal 3, json_response['pain_point']['importance']
  end

  test "should not quick create pain point without content" do
    assert_no_difference('PainPoint.count') do
      post api_v1_pain_points_quick_path, 
        params: { content: '' },
        headers: @headers
    end

    assert_response :unprocessable_entity
    json_response = JSON.parse(response.body)
    assert_equal 'ペインポイントの作成に失敗しました', json_response['message']
  end

  test "should not quick create pain point without authentication" do
    assert_no_difference('PainPoint.count') do
      post api_v1_pain_points_quick_path, 
        params: { content: 'テストペインポイント' }
    end

    assert_response :unauthorized
  end

  test "should not quick create pain point with nil content" do
    assert_no_difference('PainPoint.count') do
      post api_v1_pain_points_quick_path, 
        params: { content: nil },
        headers: @headers
    end

    assert_response :unprocessable_entity
  end
end