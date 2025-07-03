require 'rails_helper'

RSpec.describe OpenAiService do
  let(:service) { described_class.new }
  let(:pain_point) do
    double('PainPoint',
      title: 'テストの実行時間が長い',
      description: '大規模なテストスイートの実行に30分以上かかる',
      category: '開発効率',
      severity: 4,
      frequency: '毎日'
    )
  end

  describe '#initialize' do
    context 'when API key is configured' do
      before do
        allow(Rails.application.config).to receive(:openai).and_return({
          api_key: 'test-api-key',
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          temperature: 0.7
        })
      end

      it 'initializes without error' do
        expect { described_class.new }.not_to raise_error
      end
    end

    context 'when API key is not configured' do
      before do
        allow(Rails.application.config).to receive(:openai).and_return({
          api_key: nil,
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          temperature: 0.7
        })
      end

      it 'raises AuthenticationError' do
        expect { described_class.new }.to raise_error(
          OpenAiService::AuthenticationError,
          'OpenAI API key not configured'
        )
      end
    end
  end

  describe '#generate_conversation' do
    let(:mock_response) do
      {
        'choices' => [
          {
            'message' => {
              'content' => 'テストの実行時間を短縮する方法について考えてみましょう。'
            }
          }
        ]
      }
    end

    before do
      allow(Rails.application.config).to receive(:openai).and_return({
        api_key: 'test-api-key',
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7
      })
      
      stub_request(:post, 'https://api.openai.com/v1/chat/completions')
        .to_return(status: 200, body: mock_response.to_json, headers: { 'Content-Type' => 'application/json' })
    end

    it 'generates a conversation response' do
      result = service.generate_conversation(pain_point)
      expect(result).to eq('テストの実行時間を短縮する方法について考えてみましょう。')
    end

    context 'with previous messages' do
      let(:messages) do
        [
          { role: 'user', content: '並列実行は可能ですか？' },
          { role: 'assistant', content: 'はい、並列実行は有効な解決策です。' }
        ]
      end

      it 'includes previous messages in the request' do
        service.generate_conversation(pain_point, messages)
        
        expect(WebMock).to have_requested(:post, 'https://api.openai.com/v1/chat/completions')
          .with { |req| 
            body = JSON.parse(req.body)
            body['messages'].size > 2 && 
            body['messages'].any? { |m| m['content'].include?('並列実行は可能ですか？') }
          }
      end
    end
  end

  describe '#generate_deepening_questions' do
    let(:mock_response) do
      {
        'choices' => [
          {
            'message' => {
              'content' => "1. なぜこの問題が重要なのか？\n2. どうやって解決できるか？\n3. 実装する価値があるか？"
            }
          }
        ]
      }
    end

    before do
      allow(Rails.application.config).to receive(:openai).and_return({
        api_key: 'test-api-key',
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7
      })
      
      stub_request(:post, 'https://api.openai.com/v1/chat/completions')
        .to_return(status: 200, body: mock_response.to_json, headers: { 'Content-Type' => 'application/json' })
    end

    it 'generates deepening questions' do
      result = service.generate_deepening_questions(pain_point)
      expect(result).to include('なぜこの問題が重要なのか？')
      expect(result).to include('どうやって解決できるか？')
      expect(result).to include('実装する価値があるか？')
    end
  end

  describe 'error handling' do
    before do
      allow(Rails.application.config).to receive(:openai).and_return({
        api_key: 'test-api-key',
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.7
      })
    end

    context 'when API returns 401' do
      before do
        stub_request(:post, 'https://api.openai.com/v1/chat/completions')
          .to_return(status: 401, body: { error: { message: 'Invalid API key' } }.to_json)
      end

      it 'raises AuthenticationError' do
        expect { service.generate_conversation(pain_point) }
          .to raise_error(OpenAiService::AuthenticationError, /Invalid API key/)
      end
    end

    context 'when API returns 429' do
      before do
        stub_request(:post, 'https://api.openai.com/v1/chat/completions')
          .to_return(status: 429, body: { error: { message: 'Rate limit exceeded' } }.to_json)
      end

      it 'raises RateLimitError' do
        expect { service.generate_conversation(pain_point) }
          .to raise_error(OpenAiService::RateLimitError, 'Rate limit exceeded. Please try again later.')
      end
    end

    context 'when API returns 500' do
      before do
        stub_request(:post, 'https://api.openai.com/v1/chat/completions')
          .to_return(status: 500)
      end

      it 'raises ApiError' do
        expect { service.generate_conversation(pain_point) }
          .to raise_error(OpenAiService::ApiError, /OpenAI server error/)
      end
    end

    context 'when request times out' do
      before do
        stub_request(:post, 'https://api.openai.com/v1/chat/completions')
          .to_timeout
      end

      it 'raises ApiError with timeout message' do
        expect { service.generate_conversation(pain_point) }
          .to raise_error(OpenAiService::ApiError, /Request timeout/)
      end
    end

    context 'when response has no content' do
      before do
        stub_request(:post, 'https://api.openai.com/v1/chat/completions')
          .to_return(status: 200, body: { choices: [{ message: {} }] }.to_json)
      end

      it 'raises ApiError' do
        expect { service.generate_conversation(pain_point) }
          .to raise_error(OpenAiService::ApiError, 'No content in response')
      end
    end
  end
end