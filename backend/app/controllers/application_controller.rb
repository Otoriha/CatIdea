class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :set_current_user

  protected

  def set_current_user
    @current_user = User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def current_user
    @current_user
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
end
