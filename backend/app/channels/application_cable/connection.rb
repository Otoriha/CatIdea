module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user
    
    def connect
      self.current_user = find_verified_user
    end
    
    private
    
    def find_verified_user
      token = request.params[:token]
      return reject_unauthorized_connection unless token
      
      payload = JsonWebToken.decode(token)
      return reject_unauthorized_connection unless payload
      
      # ブラックリストチェック
      if payload['jti'] && JwtBlacklist.active.exists?(jti: payload['jti'])
        return reject_unauthorized_connection
      end
      
      user = User.find(payload['user_id'])
      user || reject_unauthorized_connection
    rescue StandardError
      reject_unauthorized_connection
    end
  end
end