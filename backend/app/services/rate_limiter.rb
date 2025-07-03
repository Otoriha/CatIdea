class RateLimiter
  LIMITS = {
    conversation: { requests: 10, period: 1.minute },
    deepening_questions: { requests: 5, period: 1.minute },
    global: { requests: 50, period: 1.hour }
  }.freeze

  def initialize(user, action_type = :global)
    @user = user
    @action_type = action_type
    @redis = Redis.new(url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0"))
  end

  def allowed?
    !exceeded?
  end

  def exceeded?
    current_count >= limit[:requests]
  end

  def track!
    key = redis_key

    # Increment counter
    count = @redis.incr(key)

    # Set expiration on first request
    if count == 1
      @redis.expire(key, limit[:period].to_i)
    end

    count
  end

  def current_count
    @redis.get(redis_key).to_i
  end

  def reset!
    @redis.del(redis_key)
  end

  def time_until_reset
    ttl = @redis.ttl(redis_key)
    ttl > 0 ? ttl : 0
  end

  private

  def limit
    LIMITS[@action_type] || LIMITS[:global]
  end

  def redis_key
    "rate_limit:#{@user.id}:#{@action_type}"
  end
end
