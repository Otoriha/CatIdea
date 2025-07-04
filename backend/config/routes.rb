Rails.application.routes.draw do
  # Action Cable WebSocket endpoint
  mount ActionCable.server => '/cable'
  
  # API routes
  namespace :api do
    namespace :v1 do
      # Pain Points routes
      post 'pain_points/quick', to: 'pain_points#quick_create'
      resources :pain_points, except: [:new, :edit] do
        member do
          get 'related'
        end
        resources :ai_conversations, only: [:create]
        resources :ideas, only: [:create]
      end
      
      # Ideas routes
      resources :ideas, except: [:new, :create]
      
      # Tags routes
      resources :tags, only: [:index]
      
      # AI Conversations routes
      resources :ai_conversations, only: [:index, :show] do
        member do
          post 'messages', to: 'ai_conversations#send_message'
        end
      end
      
      # Authentication routes
      post 'auth/signup', to: 'auth#signup'
      post 'auth/login', to: 'auth#login'
      delete 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'
      
      # OAuth routes
      get 'auth/github/callback', to: 'auth#github_callback'
      get 'auth/failure', to: 'auth#github_failure'
      
      get 'health', to: 'health#index'
    end
  end
  
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # OAuth routes (outside of API namespace)
  get '/auth/github', to: 'api/v1/auth#github', as: 'github_auth'
  get '/auth/github/callback', to: 'api/v1/auth#github_callback'
  get '/auth/failure', to: 'api/v1/auth#github_failure'
  
  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end