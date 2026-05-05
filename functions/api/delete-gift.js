export async function onRequestPost({ request, env }) {
    const body = await request.json();
    const id = Number(body.id);
  
    if (!id) {
      return Response.json({ error: "رقم الهدية مطلوب" }, { status: 400 });
    }
  
    await env.DB.prepare(
      "DELETE FROM gifts WHERE id = ?"
    ).bind(id).run();
  
    return Response.json({ success: true });
  }