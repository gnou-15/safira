import { supabase } from './supabase.js';

/**
 * Checks and increments the daily rate limit for serverless endpoints.
 * Returns true if the request is allowed to proceed, false if rate limited (in which case it sends 429).
 */
export async function checkRateLimit(req, res, user) {
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  const { id: userId, username } = user;

  // 1. Bypass check for developer key EUT-235
  if (username === 'EUT-235') {
    return true;
  }

  try {
    // 2. Fetch user's limit configuration
    const { data: userProfile, error: profileErr } = await supabase
      .from('safira_users')
      .select('daily_limit')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.warn("Could not fetch daily limit. Proceeding without rate limits:", profileErr.message);
      return true;
    }

    const dailyLimit = userProfile?.daily_limit ?? 20;

    // 3. Fetch today's count
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: usageData, error: usageErr } = await supabase
      .from('safira_user_usage')
      .select('request_count')
      .eq('user_id', userId)
      .eq('usage_date', todayStr)
      .maybeSingle();

    if (usageErr) {
      console.warn("Could not fetch user usage. Proceeding without rate limits:", usageErr.message);
      return true;
    }

    const currentCount = usageData?.request_count ?? 0;

    if (currentCount >= dailyLimit) {
      res.status(429).json({
        error: `Daily AI request limit reached (${currentCount}/${dailyLimit}). Please try again tomorrow.`
      });
      return false;
    }

    // 4. Increment usage count
    if (currentCount === 0) {
      const { error: insertErr } = await supabase
        .from('safira_user_usage')
        .insert([{ user_id: userId, usage_date: todayStr, request_count: 1 }]);

      if (insertErr) {
        console.error("Error creating usage record:", insertErr.message);
      }
    } else {
      const { error: updateErr } = await supabase
        .from('safira_user_usage')
        .update({ request_count: currentCount + 1 })
        .eq('user_id', userId)
        .eq('usage_date', todayStr);

      if (updateErr) {
        console.error("Error updating usage record:", updateErr.message);
      }
    }

    return true;
  } catch (err) {
    console.warn("Unexpected error in rate limiter. Proceeding without rate limits:", err.message);
    return true;
  }
}
