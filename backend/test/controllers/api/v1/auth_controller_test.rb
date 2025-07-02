require "test_helper"

class Api::V1::AuthControllerTest < ActionDispatch::IntegrationTest
  test "should get signup" do
    get api_v1_auth_signup_url
    assert_response :success
  end

  test "should get login" do
    get api_v1_auth_login_url
    assert_response :success
  end

  test "should get logout" do
    get api_v1_auth_logout_url
    assert_response :success
  end
end
