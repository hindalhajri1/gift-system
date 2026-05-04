export async function onRequestGet({ env }) {
    const rows = await env.DB.prepare(
      "SELECT employee_name, gift_name, created_at FROM results ORDER BY id DESC LIMIT 50"
    ).all();
  
    return Response.json(rows.results);
  }