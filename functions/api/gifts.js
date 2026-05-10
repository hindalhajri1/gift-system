export async function onRequestGet({ env }) {
  const rows = await env.DB.prepare(
    "SELECT id, name, qty, gender, image FROM gifts ORDER BY id DESC"
  ).all();

  return Response.json(rows.results);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();

  const name = body.name?.trim();
  const qty = parseInt(body.qty, 10);
  const gender = body.gender || "all";
  const image = body.image?.trim() || "";

  if (!name || !Number.isInteger(qty) || qty <= 0) {
    return Response.json({ error: "اكتب اسم الهدية والكمية بشكل صحيح" }, { status: 400 });
  }

  await env.DB.prepare(
    "INSERT INTO gifts (name, qty, gender, image) VALUES (?, ?, ?, ?)"
  ).bind(name, qty, gender, image).run();

  return Response.json({ success: true });
}