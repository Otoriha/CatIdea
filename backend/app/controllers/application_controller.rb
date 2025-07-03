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
    return nil unless request.headers['Authorization'].present?
    
    token = request.headers['Authorization'].split(' ').last
    payload = JsonWebToken.decode(token)
    User.find(payload['user_id']) if payload
  rescue StandardError
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