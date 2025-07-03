FactoryBot.define do
  factory :api_usage do
    user { nil }
    ai_model { "MyString" }
    input_tokens { 1 }
    output_tokens { 1 }
    total_tokens { 1 }
    cost { "9.99" }
    request_type { "MyString" }
    metadata { "" }
  end
end
