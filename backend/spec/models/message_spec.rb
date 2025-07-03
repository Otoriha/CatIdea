require 'rails_helper'

RSpec.describe Message, type: :model do
  let(:user) { create(:user) }
  let(:pain_point) { create(:pain_point, user: user) }
  let(:conversation) { create(:ai_conversation, pain_point: pain_point, user: user) }
  
  describe 'associations' do
    it { should belong_to(:ai_conversation) }
  end
  
  describe 'validations' do
    it { should validate_presence_of(:sender_type) }
    it { should validate_presence_of(:content) }
    it { should validate_inclusion_of(:sender_type).in_array(['user', 'ai']) }
  end
  
  describe 'scopes' do
    let!(:user_message) { create(:message, ai_conversation: conversation, sender_type: 'user') }
    let!(:ai_message) { create(:message, ai_conversation: conversation, sender_type: 'ai') }
    let!(:old_message) { create(:message, ai_conversation: conversation, sender_type: 'ai', created_at: 2.days.ago) }
    
    describe '.by_sender' do
      it 'returns only user messages' do
        expect(Message.by_sender('user')).to contain_exactly(user_message)
      end
      
      it 'returns only ai messages' do
        expect(Message.by_sender('ai')).to contain_exactly(ai_message, old_message)
      end
    end
    
    describe '.ordered' do
      it 'orders by created_at asc' do
        expect(Message.ordered.first).to eq(old_message)
        expect(Message.ordered.last).to eq(ai_message)
      end
    end
  end
end