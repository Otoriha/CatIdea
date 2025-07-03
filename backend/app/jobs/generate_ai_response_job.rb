class GenerateAiResponseJob < ApplicationJob
  queue_as :default

  def perform(conversation, user_message)
    return unless conversation.active?

    begin
      # Get conversation history
      messages = conversation.messages.ordered.map do |msg|
        {
          role: msg.sender_type == "user" ? "user" : "assistant",
          content: msg.content
        }
      end

      # Generate AI response
      service = OpenAiService.new
      response = service.generate_conversation(conversation.pain_point, messages)

      # Calculate tokens (this is a simplified estimation)
      model = Rails.application.config.openai[:model]
      input_tokens = estimate_tokens(messages)
      output_tokens = estimate_tokens(response)

      # Track API usage
      ApiUsage.track_usage(
        user: conversation.user,
        model: model,
        request_type: "conversation",
        input_tokens: input_tokens,
        output_tokens: output_tokens,
        metadata: {
          conversation_id: conversation.id,
          message_id: user_message.id
        }
      )

      # Add AI response
      ai_message = conversation.add_message("ai", response,
                                           input_tokens: input_tokens,
                                           output_tokens: output_tokens)

      # Broadcast the response via ActionCable
      ConversationChannel.broadcast_to(
        conversation,
        {
          type: "ai_message",
          message: {
            id: ai_message.id,
            sender_type: "ai",
            content: response,
            created_at: ai_message.created_at
          }
        }
      )

      # Check if cost limit is approaching
      if conversation.user.monthly_api_cost > 8.0 # 80% of limit
        ConversationChannel.broadcast_to(
          conversation,
          {
            type: "warning",
            message: "You are approaching your monthly API cost limit"
          }
        )
      end

    rescue OpenAiService::RateLimitError => e
      handle_error(conversation, "Rate limit exceeded. Please try again later.", :active)
    rescue OpenAiService::ApiError => e
      handle_error(conversation, "AI service error: #{e.message}", :error)
    rescue StandardError => e
      Rails.logger.error "GenerateAiResponseJob error: #{e.message}"
      handle_error(conversation, "An unexpected error occurred", :error)
    end
  end

  private

  def estimate_tokens(content)
    # Rough estimation: 1 token ≈ 4 characters
    return 0 unless content

    text = content.is_a?(Array) ? content.map { |m| m[:content] }.join(" ") : content.to_s
    (text.length / 4.0).ceil
  end

  def handle_error(conversation, error_message, status)
    conversation.update!(status: status)

    ConversationChannel.broadcast_to(
      conversation,
      {
        type: "error",
        message: error_message
      }
    )
  end
end
