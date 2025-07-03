FactoryBot.define do
  factory :pain_point do
    user
    sequence(:title) { |n| "Pain Point #{n}" }
    description { "This is a test pain point" }
    importance { 3 }
  end
end