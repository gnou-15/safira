import { supabase } from '../config/supabase.js';

/**
 * Express middleware to enforce daily rate limits on AI requests.
 * Bypasses checks for user 'EUT-235'.
 */
export async function rateLimiter(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: userId, username } = req.user;

  // 1. Always bypass rate limits for developer username EUT-235
  if (username === 'EUT-235') {
    return next();
  }

  try {
    // 2. Query user's daily limit
    const { data: userProfile, error: profileErr } = await supabase
      .from('safira_users')
      .select('daily_limit')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.warn("Could not fetch daily limit. Proceeding without rate limits:", profileErr.message);
      return next();
    }

    const dailyLimit = userProfile?.daily_limit ?? 20; // fallback to 20 if limit not set

    // 3. Query today's usage (based on YYYY-MM-DD in UTC/server time)
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: usageData, error: usageErr } = await supabase
      .from('safira_user_usage')
      .select('request_count')
      .eq('user_id', userId)
      .eq('usage_date', todayStr)
      .maybeSingle();

    if (usageErr) {
      console.warn("Could not fetch user usage. Proceeding without rate limits (is migration applied?):", usageErr.message);
      return next();
    }

    const currentCount = usageData?.request_count ?? 0;

    if (currentCount >= dailyLimit) {
      return res.status(429).json({
        error: `Daily AI request limit reached (${currentCount}/${dailyLimit}). Please try again tomorrow.`
      });
    }

    // 4. Increment usage count in DB
    if (currentCount === 0) {
      // First request of the day
      const { error: insertErr } = await supabase
        .from('safira_user_usage')
        .insert([{ user_id: userId, usage_date: todayStr, request_count: 1 }]);

      if (insertErr) {
        console.error("Error creating usage record:", insertErr.message);
      }
    } else {
      // Increment request count
      const { error: updateErr } = await supabase
        .from('safira_user_usage')
        .update({ request_count: currentCount + 1 })
        .eq('user_id', userId)
        .eq('usage_date', todayStr);

      if (updateErr) {
        console.error("Error updating usage record:", updateErr.message);
      }
    }

    next();
  } catch (err) {
    console.warn("Unexpected error in rate limiter. Proceeding without rate limits:", err.message);
    next();
  }
}
