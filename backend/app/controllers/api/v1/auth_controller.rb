class Api::V1::AuthController < ApplicationController
  before_action :require_login, only: [:logout]

  def me
    if logged_in?
      render json: {
        user: current_user_response,
        logged_in: true
      }, status: :ok
    else
      render json: {
        user: nil,
        logged_in: false
      }, status: :ok
    end
  end

  def signup
    user = User.new(user_params)
    
    if user.save
      session[:user_id] = user.id
      render json: {
        message: 'ユーザー登録が完了しました',
        user: user_response(user)
      }, status: :created
    else
      render json: {
        message: 'ユーザー登録に失敗しました',
        errors: user.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email]&.downcase)
    
    if user&.authenticate(params[:password])
      session[:user_id] = user.id
      render json: {
        message: 'ログインしました',
        user: user_response(user)
      }, status: :ok
    else
      render json: {
        message: 'メールアドレスまたはパスワードが正しくありません'
      }, status: :unauthorized
    end
  end

  def logout
    session[:user_id] = nil
    render json: {
      message: 'ログアウトしました'
    }, status: :ok
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end

  def user_response(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    }
  end
end
