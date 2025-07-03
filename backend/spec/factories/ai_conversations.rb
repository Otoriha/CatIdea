FactoryBot.define do
  factory :ai_conversation do
    user
    pain_point
    status { "active" }
    total_tokens { 0 }
    total_cost { 0.0 }
  end
end