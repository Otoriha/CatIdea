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
        user: user_response(user),
        token: generate_jwt_token(user) # Optional: JWT token for API access
      }, status: :ok
    else
      render json: {
        message: 'メールアドレスまたはパスワードが正しくありません'
      }, status: :unauthorized
    end
  end

  def logout
    session[:user_id] = nil

    # JWTトークンが提供されている場合、ブラックリストに追加
    if request.headers['Authorization'].present?
      token = request.headers['Authorization'].split(' ').last
      begin
        payload = JsonWebToken.decode(token)
        if payload && payload['jti'] && payload['exp']
          JwtBlacklist.create!(
            jti: payload['jti'],
            expires_at: Time.at(payload['exp'])
          )
        end
      rescue StandardError => e
        Rails.logger.error "JWT blacklist error: #{e.message}"
      end
    end

    render json: {
      message: 'ログアウトしました'
    }, status: :ok
  end

  def github_callback
    auth = request.env['omniauth.auth']
    
    # GitHubアカウント情報を取得
    github_uid = auth.uid
    email = auth.info.email
    name = auth.info.name || auth.info.nickname
    
    # 既存ユーザーを検索またはGitHubアカウントで新規作成
    user = User.find_by(email: email) || User.find_by(github_uid: github_uid)
    Rails.logger.info "GitHub OAuth: Found existing user: #{user.present?}"
    
    if user
      # 既存ユーザーにGitHub UIDを追加（まだない場合）
      user.update(github_uid: github_uid) unless user.github_uid
      Rails.logger.info "GitHub OAuth: Updated existing user #{user.id}"
    else
      # 新規ユーザー作成
      user = User.new(
        email: email,
        name: name,
        github_uid: github_uid,
        password: SecureRandom.hex(16) # ランダムパスワード（GitHubログインのため）
      )
      
      unless user.save
        Rails.logger.error "GitHub OAuth: Failed to create user: #{user.errors.full_messages}"
        return render json: {
          message: 'ユーザー作成に失敗しました',
          errors: user.errors.full_messages
        }, status: :unprocessable_entity
      end
      Rails.logger.info "GitHub OAuth: Created new user #{user.id}"
    end
    
    # ログイン処理
    session[:user_id] = user.id
    
    # JWTトークン生成
    token = JsonWebToken.encode(user_id: user.id)
    Rails.logger.info "GitHub OAuth: Generated JWT for user #{user.id}, token: #{token[0..20]}..."
    
    # フロントエンドにリダイレクト（トークンとユーザー情報を付与）
    redirect_to "#{ENV['FRONTEND_URL'] || 'http://localhost:3001'}/auth/callback?token=#{token}&user_id=#{user.id}&user_name=#{URI.encode_www_form_component(user.name)}", allow_other_host: true
  end

  def github_failure
    error_msg = params[:message] || 'unknown_error'
    strategy = params[:strategy] || 'unknown'
    
    Rails.logger.error "GitHub OAuth failure: #{error_msg}, strategy: #{strategy}"
    
    redirect_to "#{ENV['FRONTEND_URL'] || 'http://localhost:3001'}/auth/callback?error=#{error_msg}&strategy=#{strategy}", allow_other_host: true
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
