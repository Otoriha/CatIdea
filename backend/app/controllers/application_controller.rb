class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :set_current_user

  protected

  def set_current_user
    # First try session-based authentication
    @current_user = User.find_by(id: session[:user_id]) if session[:user_id]
    
    # If no session user, try JWT authentication
    @current_user ||= current_user_from_jwt
  end

  def current_user
    @current_user
  end
  
  def current_user_from_jwt
    Rails.logger.info "JWT Auth Debug: Authorization header present: #{request.headers['Authorization'].present?}"
    return nil unless request.headers['Authorization'].present?
    
    token = request.headers['Authorization'].split(' ').last
    Rails.logger.info "JWT Auth Debug: Token extracted: #{token.present? ? token[0..20] + '...' : 'nil'}"
    
    payload = JsonWebToken.decode(token)
    Rails.logger.info "JWT Auth Debug: Payload decoded: #{payload.present?}"
    
    return nil unless payload
    
    # ブラックリストチェック
    if payload['jti'] && JwtBlacklist.active.exists?(jti: payload['jti'])
      Rails.logger.info "JWT Auth Debug: Token blacklisted"
      return nil
    end
    
    user = User.find(payload['user_id'])
    Rails.logger.info "JWT Auth Debug: User found: #{user.present?}"
    user
  rescue StandardError => e
    Rails.logger.error "JWT Auth Error: #{e.message}"
    nil
  end

  def logged_in?
    !!current_user
  end

  def require_login
    unless logged_in?
      render json: {
        message: 'ログインが必要です'
      }, status: :unauthorized
    end
  end

  def current_user_response
    if current_user
      {
        id: current_user.id,
        name: current_user.name,
        email: current_user.email
      }
    else
      nil
    end
  end
  
  # Generate JWT token for API responses
  def generate_jwt_token(user)
    JsonWebToken.encode(user_id: user.id)
  end
end