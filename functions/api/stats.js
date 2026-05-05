export async function onRequestGet({ env }) {
    const participants = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM results"
    ).first();
  
    const remaining = await env.DB.prepare(
      "SELECT COALESCE(SUM(qty), 0) as total FROM gifts"
    ).first();
  
    const giftTypes = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM gifts"
    ).first();
  
    return Response.json({
      total: participants.count || 0,
      remaining: remaining.total || 0,
      types: giftTypes.count || 0
    });
  }