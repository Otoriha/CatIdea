module Api
  module V1
    class HealthController < ApplicationController
      def index
        render json: {
          status: 'ok',
          message: 'CatIdea API is running!',
          timestamp: Time.current,
          environment: {
            rails_env: Rails.env,
            openai_api_key_present: ENV['OPENAI_API_KEY'].present?,
            openai_model: Rails.application.config.openai[:model],
            openai_api_key_length: ENV['OPENAI_API_KEY']&.length
          }
        }
      end
    end
  end
end