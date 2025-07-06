class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base || Rails.application.secrets.secret_key_base
  
  def self.encode(payload, exp = 30.days.from_now)
    Rails.logger.info "JWT Encode: SECRET_KEY present: #{SECRET_KEY.present?}"
    payload[:exp] = exp.to_i
    payload[:jti] = SecureRandom.uuid
    payload[:iat] = Time.current.to_i
    JWT.encode(payload, SECRET_KEY)
  end
  
  def self.decode(token)
    Rails.logger.info "JWT Decode: SECRET_KEY present: #{SECRET_KEY.present?}, token present: #{token.present?}"
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError, JWT::ExpiredSignature => e
    Rails.logger.error "JWT Decode Error: #{e.message}"
    nil
  end
end