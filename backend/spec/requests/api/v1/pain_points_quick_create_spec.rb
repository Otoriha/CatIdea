require 'rails_helper'

RSpec.describe "Api::V1::PainPoints Quick Create", type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe "POST /api/v1/pain_points/quick" do
    context "認証済みユーザーの場合" do
      context "有効なcontentを送信した場合" do
        it "ペインポイントが作成される" do
          expect {
            post "/api/v1/pain_points/quick", 
              params: { content: "通勤電車が混雑していて不快" },
              headers: headers
          }.to change(PainPoint, :count).by(1)

          expect(response).to have_http_status(:created)
          json = JSON.parse(response.body)
          expect(json['message']).to eq('ペインポイントをクイック作成しました')
          expect(json['pain_point']['title']).to eq('通勤電車が混雑していて不快')
          expect(json['pain_point']['importance']).to eq(3)
        end
      end

      context "空のcontentを送信した場合" do
        it "ペインポイントが作成されない" do
          expect {
            post "/api/v1/pain_points/quick", 
              params: { content: "" },
              headers: headers
          }.not_to change(PainPoint, :count)

          expect(response).to have_http_status(:unprocessable_entity)
          json = JSON.parse(response.body)
          expect(json['message']).to eq('ペインポイントの作成に失敗しました')
          expect(json['errors']).to include("Title can't be blank")
        end
      end

      context "nilのcontentを送信した場合" do
        it "ペインポイントが作成されない" do
          expect {
            post "/api/v1/pain_points/quick", 
              params: { content: nil },
              headers: headers
          }.not_to change(PainPoint, :count)

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    context "未認証ユーザーの場合" do
      it "401エラーが返される" do
        expect {
          post "/api/v1/pain_points/quick", 
            params: { content: "テストペインポイント" }
        }.not_to change(PainPoint, :count)

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end