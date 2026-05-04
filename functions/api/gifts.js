export async function onRequestGet({ env }) {
    const rows = await env.DB.prepare(
      "SELECT id, name, qty, gender FROM gifts ORDER BY id DESC"
    ).all();
  
    return Response.json(rows.results);
  }
  
  export async function onRequestPost({ request, env }) {
    const body = await request.json();
    const name = body.name?.trim();
    const qty = Number(body.qty || 0);
    const gender = body.gender || "all";
  
    if (!name || qty <= 0) {
      return Response.json({ error: "بيانات الهدية غير مكتملة" }, { status: 400 });
    }
  
    await env.DB.prepare(
      "INSERT INTO gifts (name, qty, gender) VALUES (?, ?, ?)"
    ).bind(name, qty, gender).run();
  
    return Response.json({ success: true });
  }