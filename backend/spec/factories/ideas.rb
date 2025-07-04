FactoryBot.define do
  factory :idea do
    user { nil }
    pain_point { nil }
    ai_conversation { nil }
    title { "MyString" }
    description { "MyText" }
    feasibility { 1 }
    impact { 1 }
    status { "MyString" }
  end
end
