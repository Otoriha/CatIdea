namespace :jwt_blacklist do
  desc "Clean up expired JWT blacklist entries"
  task cleanup: :environment do
    deleted_count = JwtBlacklist.cleanup_expired
    Rails.logger.info "Cleaned up #{deleted_count} expired JWT blacklist entries"
    puts "Cleaned up #{deleted_count} expired JWT blacklist entries"
  end
end