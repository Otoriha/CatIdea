FactoryBot.define do
  factory :api_usage do
    user
    ai_model { "gpt-4.1-nano" }
    input_tokens { 100 }
    output_tokens { 50 }
    total_tokens { 150 }
    cost { 0.000045 }
    request_type { "conversation" }
    metadata { {} }
  end
end
