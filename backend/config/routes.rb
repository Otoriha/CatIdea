Rails.application.routes.draw do
  # API routes
  namespace :api do
    namespace :v1 do
      # Pain Points routes
      resources :pain_points, except: [:new, :edit] do
        collection do
          post :quick_create
        end
      end
      
      # Authentication routes
      post 'auth/signup', to: 'auth#signup'
      post 'auth/login', to: 'auth#login'
      delete 'auth/logout', to: 'auth#logout'
      get 'auth/me', to: 'auth#me'
      
      get 'health', to: 'health#index'
    end
  end
  
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
end