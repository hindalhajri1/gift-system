export async function onRequestPost({ request, env }) {
    try {
      const body = await request.json();
      const employeeName = body.name?.trim();
  
      if (!employeeName) {
        return Response.json({ error: "اسم الموظف مطلوب" }, { status: 400 });
      }
  
      const existing = await env.DB.prepare(
        "SELECT id FROM results WHERE employee_name = ?"
      ).bind(employeeName).first();
  
      if (existing) {
        return Response.json({ error: "تم تسجيلك مسبقًا ولا يمكن السحب مرة أخرى" }, { status: 409 });
      }
  
      const gift = await env.DB.prepare(
        "SELECT id, name FROM gifts WHERE qty > 0 ORDER BY RANDOM() LIMIT 1"
      ).first();
  
      if (!gift) {
        return Response.json({ error: "انتهت جميع الهدايا" }, { status: 404 });
      }
  
      await env.DB.prepare(
        "UPDATE gifts SET qty = qty - 1 WHERE id = ?"
      ).bind(gift.id).run();
  
      await env.DB.prepare(
        "INSERT INTO results (employee_name, gift_id, gift_name) VALUES (?, ?, ?)"
      ).bind(employeeName, gift.id, gift.name).run();
  
      return Response.json({
        success: true,
        gift: gift.name
      });
  
    } catch (error) {
      return Response.json({
        error: error.message || "حدث خطأ في السحب"
      }, { status: 500 });
    }
  }