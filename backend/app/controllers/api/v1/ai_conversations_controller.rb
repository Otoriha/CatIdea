class Api::V1::AiConversationsController < ApplicationController
  before_action :require_login
  before_action :check_api_cost_limit, only: [ :create, :send_message ]
  before_action :check_rate_limit, only: [ :create, :send_message ]
  before_action :set_pain_point, only: [ :create ]
  before_action :set_conversation, only: [ :show, :send_message ]

  # GET /api/v1/ai_conversations
  def index
    @conversations = current_user.ai_conversations
                                 .includes(:pain_point, :messages)
                                 .order(created_at: :desc)

    render json: @conversations, include: [ :pain_point, messages: { only: [ :id, :sender_type, :content, :created_at ] } ]
  end

  # GET /api/v1/ai_conversations/:id
  def show
    render json: @conversation, include: {
      pain_point: { only: [ :id, :title, :description ] },
      messages: { only: [ :id, :sender_type, :content, :input_tokens, :output_tokens, :created_at ] }
    }
  end

  # POST /api/v1/pain_points/:pain_point_id/ai_conversations
  def create
    @conversation = current_user.ai_conversations.find_or_initialize_by(pain_point: @pain_point)

    # 既存の会話がerrorステータスの場合は削除して新規作成
    if @conversation.persisted? && @conversation.status == 'error'
      @conversation.destroy
      @conversation = current_user.ai_conversations.build(pain_point: @pain_point)
    end

    if @conversation.persisted?
      # 既存の会話をactiveに戻す
      @conversation.update!(status: :active) unless @conversation.active?
      render json: @conversation, include: :messages, status: :ok
    elsif @conversation.save
      # Generate initial AI questions unless skip_initial_questions is set
      unless params[:skip_initial_questions]
        generate_initial_questions(@conversation)
      end
      render json: @conversation, include: :messages, status: :created
    else
      render json: { errors: @conversation.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/ai_conversations/:id/messages
  def send_message
    unless @conversation.active?
      return render json: { error: "Conversation is not active" }, status: :unprocessable_entity
    end

    # Add user message
    user_message = @conversation.messages.create!(
      sender_type: "user",
      content: message_params[:content]
    )

    # Generate AI response
    GenerateAiResponseJob.perform_later(@conversation, user_message)

    render json: {
      message: user_message,
      status: "AI response is being generated"
    }, status: :created
  end

  private

  def check_api_cost_limit
    unless current_user.can_use_api?
      render json: {
        error: "Monthly API cost limit reached",
        monthly_cost: current_user.monthly_api_cost,
        limit: 10.0
      }, status: :payment_required
    end
  end

  def check_rate_limit
    action_type = action_name == "create" ? :deepening_questions : :conversation
    limiter = RateLimiter.new(current_user, action_type)

    if limiter.exceeded?
      render json: {
        error: "Rate limit exceeded",
        retry_after: limiter.time_until_reset
      }, status: :too_many_requests
    else
      limiter.track!
    end
  end

  def set_pain_point
    @pain_point = current_user.pain_points.find(params[:pain_point_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Pain point not found" }, status: :not_found
  end

  def set_conversation
    @conversation = current_user.ai_conversations.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Conversation not found" }, status: :not_found
  end

  def message_params
    params.require(:message).permit(:content)
  end

  def generate_initial_questions(conversation)
    service = OpenAiService.new
    questions = service.generate_deepening_questions(conversation.pain_point)

    # Track API usage
    model = Rails.application.config.openai[:model]
    # Estimate tokens (rough calculation)
    input_tokens = 200
    output_tokens = 150

    ApiUsage.track_usage(
      user: current_user,
      model: model,
      request_type: "deepening_questions",
      input_tokens: input_tokens,
      output_tokens: output_tokens,
      metadata: { conversation_id: conversation.id }
    )

    # Add AI message
    conversation.add_message("ai", questions, input_tokens: input_tokens, output_tokens: output_tokens)
  rescue StandardError => e
    Rails.logger.error "Failed to generate initial questions: #{e.message}"
    conversation.update!(status: :error)
  end
end
