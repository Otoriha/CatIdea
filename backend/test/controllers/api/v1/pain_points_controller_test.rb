require "test_helper"

class Api::V1::PainPointsControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_v1_pain_points_index_url
    assert_response :success
  end

  test "should get show" do
    get api_v1_pain_points_show_url
    assert_response :success
  end

  test "should get create" do
    get api_v1_pain_points_create_url
    assert_response :success
  end

  test "should get update" do
    get api_v1_pain_points_update_url
    assert_response :success
  end

  test "should get destroy" do
    get api_v1_pain_points_destroy_url
    assert_response :success
  end

  test "should get quick_create" do
    get api_v1_pain_points_quick_create_url
    assert_response :success
  end
end
