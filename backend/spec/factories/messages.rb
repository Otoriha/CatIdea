FactoryBot.define do
  factory :message do
    ai_conversation
    sender_type { "user" }
    content { "This is a test message" }
  end
end