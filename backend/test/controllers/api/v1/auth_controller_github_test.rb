require "test_helper"

class Api::V1::AuthControllerGithubTest < ActionDispatch::IntegrationTest
  def setup
    OmniAuth.config.test_mode = true
  end

  def teardown
    OmniAuth.config.test_mode = false
  end

  test "should create new user with GitHub OAuth" do
    # GitHub OAuthのモックデータ
    OmniAuth.config.mock_auth[:github] = OmniAuth::AuthHash.new({
      uid: '12345',
      info: {
        email: 'github_user@example.com',
        name: 'GitHub User',
        nickname: 'githubuser'
      }
    })

    assert_difference('User.count', 1) do
      get '/auth/github/callback'
    end

    assert_response :redirect
    assert_redirected_to 'http://localhost:3001?auth=success'
    
    user = User.find_by(email: 'github_user@example.com')
    assert_not_nil user
    assert_equal 'GitHub User', user.name
    assert_equal '12345', user.github_uid
  end

  test "should login existing user with GitHub OAuth" do
    # 既存ユーザーを作成
    existing_user = User.create!(
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'password123',
      password_confirmation: 'password123'
    )

    # GitHub OAuthのモックデータ（既存ユーザーのメールアドレス）
    OmniAuth.config.mock_auth[:github] = OmniAuth::AuthHash.new({
      uid: '67890',
      info: {
        email: 'existing@example.com',
        name: 'Existing User',
        nickname: 'existinguser'
      }
    })

    assert_no_difference('User.count') do
      get '/auth/github/callback'
    end

    assert_response :redirect
    existing_user.reload
    assert_equal '67890', existing_user.github_uid
  end

  test "should handle GitHub OAuth failure" do
    get '/auth/failure'
    
    assert_response :redirect
    assert_redirected_to 'http://localhost:3001?auth=failure'
  end
end