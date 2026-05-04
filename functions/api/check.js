export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const mobile = url.searchParams.get("mobile");
  
    if (!mobile) {
      return Response.json({ exists: false });
    }
  
    const existing = await env.DB.prepare(
      "SELECT employee_name, gift_name FROM results WHERE mobile = ?"
    ).bind(mobile).first();
  
    if (!existing) {
      return Response.json({ exists: false });
    }
  
    return Response.json({
      exists: true,
      name: existing.employee_name,
      gift: existing.gift_name
    });
  }