# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    if Rails.env.development?
      origins "http://localhost:3001", "http://127.0.0.1:3001"
    else
      # 本番環境では環境変数でフロントエンドのURLを指定
      frontend_url = ENV["FRONTEND_URL"] || "https://your-app.vercel.app"
      origins frontend_url
    end

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end