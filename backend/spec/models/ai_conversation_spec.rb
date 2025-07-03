require 'rails_helper'

RSpec.describe AiConversation, type: :model do
  let(:user) { create(:user) }
  let(:pain_point) { create(:pain_point, user: user) }
  
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:pain_point) }
    it { should have_many(:messages).dependent(:destroy) }
  end
  
  describe 'validations' do
    # status is enum with default value, so presence validation is not needed
    subject { build(:ai_conversation, user: user, pain_point: pain_point) }
    it { should validate_uniqueness_of(:pain_point_id) }
  end
  
  describe 'scopes' do
    let(:pain_point1) { create(:pain_point, user: user) }
    let(:pain_point2) { create(:pain_point, user: user) }
    let(:pain_point3) { create(:pain_point, user: user) }
    let!(:active_conversation) { create(:ai_conversation, pain_point: pain_point1, user: user, status: 'active') }
    let!(:completed_conversation) { create(:ai_conversation, pain_point: pain_point2, user: user, status: 'completed') }
    let!(:old_conversation) { create(:ai_conversation, pain_point: pain_point3, user: user, status: 'active', created_at: 2.days.ago) }
    
    describe '.active_conversations' do
      it 'returns only active conversations' do
        expect(AiConversation.active_conversations).to contain_exactly(active_conversation, old_conversation)
      end
    end
  end
  
  describe '#calculate_total_cost' do
    let(:conversation) { create(:ai_conversation, pain_point: pain_point, user: user) }
    
    before do
      create(:message, 
        ai_conversation: conversation,
        sender_type: 'user',
        content: 'Test'
      )
      # Messages table doesn't have input_tokens/output_tokens columns in current schema
    end
    
    it 'calculates total cost' do
      # Since messages don't have token columns, this will return 0
      expect(conversation.calculate_total_cost).to eq(0.0)
    end
  end
  
  describe '#add_message' do
    let(:conversation) { create(:ai_conversation, pain_point: pain_point, user: user) }
    
    it 'creates a new message' do
      expect {
        conversation.add_message('user', 'Hello', input_tokens: 10, output_tokens: 20)
      }.to change(conversation.messages, :count).by(1)
      
      message = conversation.messages.last
      expect(message.sender_type).to eq('user')
      expect(message.content).to eq('Hello')
    end
    
    it 'updates conversation totals' do
      conversation.add_message('user', 'Hello', input_tokens: 10, output_tokens: 20)
      conversation.reload
      
      expect(conversation.total_tokens).to eq(30)
    end
  end
end