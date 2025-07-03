require 'rails_helper'

RSpec.describe ApiUsage, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
  end
  
  describe 'validations' do
    it { should validate_presence_of(:ai_model) }
    it { should validate_presence_of(:request_type) }
    it { should validate_numericality_of(:input_tokens).is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:output_tokens).is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:total_tokens).is_greater_than_or_equal_to(0) }
    it { should validate_numericality_of(:cost).is_greater_than_or_equal_to(0) }
    it { should validate_inclusion_of(:request_type).in_array(ApiUsage::REQUEST_TYPES) }
  end
  
  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:usage1) { create(:api_usage, user: user, created_at: 2.days.ago) }
    let!(:usage2) { create(:api_usage, user: user, created_at: 1.day.ago) }
    let!(:usage3) { create(:api_usage, user: user, ai_model: 'gpt-3.5-turbo') }
    
    describe '.recent' do
      it 'orders by created_at desc' do
        expect(ApiUsage.recent).to eq([usage3, usage2, usage1])
      end
    end
    
    describe '.by_model' do
      it 'filters by model name' do
        expect(ApiUsage.by_model('gpt-3.5-turbo')).to eq([usage3])
      end
    end
    
    describe '.this_month' do
      it 'returns usage from current month' do
        old_usage = create(:api_usage, user: user, created_at: 2.months.ago)
        expect(ApiUsage.this_month).not_to include(old_usage)
        expect(ApiUsage.this_month).to include(usage3)
      end
    end
  end
  
  describe '.calculate_cost' do
    it 'calculates cost for gpt-4.1-nano model' do
      cost = ApiUsage.calculate_cost('gpt-4.1-nano', 1000, 500)
      expect(cost).to eq(0.00030) # (1000 * 0.00000010) + (500 * 0.00000040)
    end
    
    it 'uses default pricing for unknown models' do
      cost = ApiUsage.calculate_cost('unknown-model', 1000, 500)
      expect(cost).to eq(0.003) # (1000 * 0.000002) + (500 * 0.000002)
    end
  end
  
  describe '.track_usage' do
    let(:user) { create(:user) }
    
    it 'creates a new usage record' do
      expect {
        ApiUsage.track_usage(
          user: user,
          model: 'gpt-4.1-nano',
          request_type: 'conversation',
          input_tokens: 100,
          output_tokens: 50,
          metadata: { test: true }
        )
      }.to change(ApiUsage, :count).by(1)
      
      usage = ApiUsage.last
      expect(usage.user).to eq(user)
      expect(usage.ai_model).to eq('gpt-4.1-nano')
      expect(usage.request_type).to eq('conversation')
      expect(usage.input_tokens).to eq(100)
      expect(usage.output_tokens).to eq(50)
      expect(usage.total_tokens).to eq(150)
      expect(usage.cost).to eq(0.000030) # (100 * 0.00000010) + (50 * 0.00000040)
      expect(usage.metadata).to eq({ 'test' => true })
    end
  end
end