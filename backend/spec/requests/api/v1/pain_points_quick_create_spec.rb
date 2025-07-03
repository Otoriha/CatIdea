require 'rails_helper'

RSpec.describe "Api::V1::PainPoints Quick Create", type: :request do
  let(:user) { create(:user) }

  describe "POST /api/v1/pain_points/quick" do
    context "認証済みユーザーの場合" do
      before do
        # セッション認証のためにログイン
        post '/api/v1/auth/login', 
          params: { email: user.email, password: user.password },
          headers: { 'Host' => 'localhost' }
        puts "Login response status: #{response.status}"
        puts "Login response body: #{response.body}"
        puts "Session after login: #{session[:user_id]}"
      end
      
      context "有効なcontentを送信した場合" do
        it "ペインポイントが作成される" do
          expect {
            post "/api/v1/pain_points/quick", 
              params: { content: "通勤電車が混雑していて不快" },
              headers: { 'Host' => 'localhost' }
          }.to change(PainPoint, :count).by(1)

          puts "Response status: #{response.status}"
          puts "Response body: #{response.body}"
          
          expect(response).to have_http_status(:created)
          json = JSON.parse(response.body)
          expect(json['message']).to eq('ペインポイントをクイック作成しました')
          
          pain_point = PainPoint.last
          expect(pain_point.title).to eq("通勤電車が混雑していて不快")
          expect(pain_point.user).to eq(user)
        end
      end

      context "空のcontentを送信した場合" do
        it "ペインポイントが作成されない" do
          expect {
            post "/api/v1/pain_points/quick", 
              params: { content: "" },
              headers: { 'Host' => 'localhost' }
          }.not_to change(PainPoint, :count)

          expect(response).to have_http_status(:unprocessable_entity)
          json = JSON.parse(response.body)
          expect(json['error']).to eq('コンテンツを入力してください')
        end
      end

      context "nilのcontentを送信した場合" do
        it "ペインポイントが作成されない" do
          expect {
            post "/api/v1/pain_points/quick", 
              params: { content: nil },
              headers: { 'Host' => 'localhost' }
          }.not_to change(PainPoint, :count)

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    context "未認証ユーザーの場合" do
      it "401エラーが返される" do
        expect {
          post "/api/v1/pain_points/quick", 
            params: { content: "テストペインポイント" },
            headers: { 'Host' => 'localhost' }
        }.not_to change(PainPoint, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end