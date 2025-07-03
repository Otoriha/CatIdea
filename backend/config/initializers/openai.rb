# OpenAI API設定
# APIキーは環境変数から取得し、サーバー側でのみ管理

Rails.application.config.openai = {
  api_key: ENV.fetch('OPENAI_API_KEY', nil),
  api_url: 'https://api.openai.com/v1',
  model: ENV.fetch('OPENAI_MODEL', 'gpt-4o-mini'),
  max_tokens: ENV.fetch('OPENAI_MAX_TOKENS', 1000).to_i,
  temperature: ENV.fetch('OPENAI_TEMPERATURE', 0.7).to_f
}

# 開発環境でAPIキーが設定されていない場合の警告
if Rails.env.development? && Rails.application.config.openai[:api_key].blank?
  Rails.logger.warn "OPENAI_API_KEY is not set. AI features will not work."
end