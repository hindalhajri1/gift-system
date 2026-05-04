export async function onRequestGet({ env }) {

    const total = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM results"
    ).first();
  
    const remaining = await env.DB.prepare(
      "SELECT SUM(qty) as total FROM gifts"
    ).first();
  
    const types = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM gifts"
    ).first();
  
    return Response.json({
      total: total.count || 0,
      remaining: remaining.total || 0,
      types: types.count || 0
    });
  }