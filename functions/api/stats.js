export async function onRequestGet({ env }) {
    const participants = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM results"
    ).first();
  
    const giftsTotal = await env.DB.prepare(
      "SELECT SUM(qty) as total FROM gifts"
    ).first();
  
    const giftTypes = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM gifts"
    ).first();
  
    return Response.json({
      total: participants.count || 0,
      remaining: giftsTotal.total || 0,
      types: giftTypes.count || 0
    });
  }