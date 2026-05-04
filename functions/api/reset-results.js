export async function onRequestPost({ env }) {
    await env.DB.prepare("DELETE FROM results").run();
    return Response.json({ success: true });
  }