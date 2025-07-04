class OpenAiService
  include HTTParty

  class ApiError < StandardError; end
  class RateLimitError < ApiError; end
  class AuthenticationError < ApiError; end

  base_uri "https://api.openai.com/v1"

  def initialize
    @api_key = Rails.application.config.openai[:api_key]
    @model = Rails.application.config.openai[:model]
    @max_tokens = Rails.application.config.openai[:max_tokens]
    @temperature = Rails.application.config.openai[:temperature]

    raise AuthenticationError, "OpenAI API key not configured" if @api_key.blank?
  end

  # ペインポイントに基づいて思考を深める対話を生成
  def generate_conversation(pain_point, messages = [])
    prompt = build_conversation_prompt(pain_point, messages)

    response = make_api_request("/chat/completions", {
      model: @model,
      messages: prompt,
      max_tokens: @max_tokens,
      temperature: @temperature
    })

    extract_message_content(response)
  end

  # なぜ・どうやってフレームワークで深掘り質問を生成
  def generate_deepening_questions(pain_point)
    prompt = build_deepening_prompt(pain_point)

    response = make_api_request("/chat/completions", {
      model: @model,
      messages: prompt,
      max_tokens: 500,
      temperature: 0.7
    })

    extract_message_content(response)
  end

  private

  def make_api_request(endpoint, body)
    options = {
      headers: {
        "Authorization" => "Bearer #{@api_key}",
        "Content-Type" => "application/json"
      },
      body: body.to_json
    }

    response = self.class.post(endpoint, options)

    handle_response_errors(response)
    response.parsed_response
  rescue Net::OpenTimeout, Net::ReadTimeout => e
    raise ApiError, "Request timeout: #{e.message}"
  rescue AuthenticationError, RateLimitError, ApiError => e
    # Re-raise our custom errors without wrapping them
    raise e
  rescue StandardError => e
    raise ApiError, "Unexpected error: #{e.message}"
  end

  def handle_response_errors(response)
    case response.code
    when 200..299
      # Success
    when 401
      error_msg = extract_error_message(response)
      Rails.logger.error "OpenAI API 401 Error: #{error_msg}"
      raise AuthenticationError, "Invalid API key: #{error_msg}"
    when 429
      raise RateLimitError, "Rate limit exceeded. Please try again later."
    when 400..499
      error_message = extract_error_message(response)
      raise ApiError, "Client error (#{response.code}): #{error_message}"
    when 500..599
      raise ApiError, "OpenAI server error (#{response.code}). Please try again later."
    else
      raise ApiError, "Unexpected response code: #{response.code}"
    end
  end

  def extract_error_message(response)
    response.parsed_response.dig("error", "message") || "Unknown error"
  rescue
    "Unknown error"
  end

  def extract_message_content(response)
    raise ApiError, "No content in response" unless response.is_a?(Hash)
    content = response.dig("choices", 0, "message", "content")
    raise ApiError, "No content in response" if content.blank?
    content
  end

  def build_conversation_prompt(pain_point, messages)
    system_prompt = {
      role: "system",
      content: build_system_prompt
    }

    context_prompt = {
      role: "user",
      content: build_context_prompt(pain_point)
    }

    # システムプロンプト + コンテキスト + 過去のメッセージ
    [ system_prompt, context_prompt ] + format_messages(messages)
  end

  def build_deepening_prompt(pain_point)
    [
      {
        role: "system",
        content: build_deepening_system_prompt
      },
      {
        role: "user",
        content: build_pain_point_summary(pain_point)
      }
    ]
  end

  def build_system_prompt
    <<~PROMPT
      あなたは個人開発者のアイデア創出を支援するAIアシスタントです。
      ユーザーが記録したペインポイント（日常の課題）について、以下の観点から思考を深める支援を行ってください：

      1. 問題の本質を明確にする
      2. 「なぜ」その問題が起きているのかを掘り下げる
      3. 「どうやって」解決できるかを具体的に考える
      4. 実現可能性と価値を評価する

      対話は以下のガイドラインに従ってください：
      - 共感的で建設的なトーンを保つ
      - 抽象的な議論ではなく、具体的な例や行動を促す
      - ユーザーの思考を整理し、新しい視点を提供する
      - 技術的な解決策だけでなく、ユーザー価値も重視する
    PROMPT
  end

  def build_deepening_system_prompt
    <<~PROMPT
      あなたは個人開発者の思考を深めるコーチです。
      提示されたペインポイントについて、「なぜ・どうやって」フレームワークを使って
      3つの深掘り質問を生成してください。

      質問は以下の形式で生成してください：
      1. なぜこの問題が重要なのか？
      2. どうやって解決できるか？
      3. 実装する価値があるか？

      各質問は具体的で、行動につながるものにしてください。
    PROMPT
  end

  def build_context_prompt(pain_point)
    <<~PROMPT
      以下のペインポイントについて考えています：

      【タイトル】#{pain_point.title}
      【説明】#{pain_point.description}
      【重要度】#{pain_point.importance}
      【緊急度】#{pain_point.urgency}

      このペインポイントについて、解決策を一緒に考えましょう。
    PROMPT
  end

  def build_pain_point_summary(pain_point)
    <<~PROMPT
      ペインポイント：「#{pain_point.title}」
      詳細：#{pain_point.description}
      重要度：#{pain_point.importance}/5
      緊急度：#{pain_point.urgency}/5
    PROMPT
  end

  def format_messages(messages)
    messages.map do |message|
      {
        role: message[:role] || "user",
        content: message[:content]
      }
    end
  end
end
