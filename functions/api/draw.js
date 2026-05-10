export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const employeeName = String(body.name || "").trim();
    const mobile = String(body.mobile || "").trim();
    const gender = String(body.gender || "").trim();

    if (!employeeName || !mobile || !gender) {
      return Response.json({ error: "الاسم والجوال والفئة مطلوبة" }, { status: 400 });
    }

    const existing = await env.DB.prepare(
      "SELECT gift_name, gift_image FROM results WHERE mobile = ?"
    ).bind(mobile).first();

    if (existing) {
      return Response.json({
        error: `تم تسجيلك مسبقًا، هديتك هي: ${existing.gift_name}`,
        gift: existing.gift_name,
        image: existing.gift_image || ""
      }, { status: 409 });
    }

    const gift = await env.DB.prepare(
      "SELECT id, name, qty, image FROM gifts WHERE qty > 0 AND (gender = ? OR gender = 'all') ORDER BY RANDOM() LIMIT 1"
    ).bind(gender).first();

    if (!gift) {
      return Response.json({ error: "انتهت الهدايا المتاحة لهذه الفئة" }, { status: 404 });
    }

    await env.DB.prepare(
      "UPDATE gifts SET qty = qty - 1 WHERE id = ? AND qty > 0"
    ).bind(gift.id).run();

    await env.DB.prepare(
      "INSERT INTO results (employee_name, mobile, gender, gift_id, gift_name, gift_image) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(employeeName, mobile, gender, gift.id, gift.name, gift.image || "").run();

    return Response.json({
      success: true,
      gift: gift.name,
      image: gift.image || ""
    });

  } catch (error) {
    return Response.json({ error: error.message || "حدث خطأ في السحب" }, { status: 500 });
  }
}