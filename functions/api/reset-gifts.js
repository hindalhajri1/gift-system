export async function onRequestPost({ env }) {
    await env.DB.prepare("DELETE FROM gifts").run();
    return Response.json({ success: true });
  }