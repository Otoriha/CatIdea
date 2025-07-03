class ConversationChannel < ApplicationCable::Channel
  def subscribed
    conversation = current_user.ai_conversations.find(params[:conversation_id])
    stream_for conversation

    # Send current status
    transmit({
      type: "connection_established",
      conversation_id: conversation.id,
      status: conversation.status
    })
  rescue ActiveRecord::RecordNotFound
    reject
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def send_message(data)
    conversation = current_user.ai_conversations.find(data["conversation_id"])

    unless conversation.active?
      transmit({
        type: "error",
        message: "Conversation is not active"
      })
      return
    end

    # Check cost limit
    unless current_user.can_use_api?
      transmit({
        type: "error",
        message: "Monthly API cost limit reached",
        monthly_cost: current_user.monthly_api_cost,
        limit: 10.0
      })
      return
    end

    # Add user message
    user_message = conversation.messages.create!(
      sender_type: "user",
      content: data["content"]
    )

    # Broadcast user message to other subscribers
    ConversationChannel.broadcast_to(
      conversation,
      {
        type: "user_message",
        message: {
          id: user_message.id,
          sender_type: "user",
          content: user_message.content,
          created_at: user_message.created_at
        }
      }
    )

    # Generate AI response asynchronously
    GenerateAiResponseJob.perform_later(conversation, user_message)

    transmit({
      type: "message_sent",
      message_id: user_message.id
    })
  rescue ActiveRecord::RecordNotFound
    transmit({
      type: "error",
      message: "Conversation not found"
    })
  rescue StandardError => e
    Rails.logger.error "ConversationChannel error: #{e.message}"
    transmit({
      type: "error",
      message: "Failed to send message"
    })
  end
end
