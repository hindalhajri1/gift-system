export async function onRequestGet({ env }) {
    const rows = await env.DB.prepare(
      "SELECT employee_name, mobile, gender, gift_name, created_at FROM results ORDER BY id DESC"
    ).all();
  
    const header = ["اسم الموظف", "رقم الجوال", "الفئة", "الهدية", "التاريخ"];
  
    const csvRows = rows.results.map(row => [
      row.employee_name || "",
      row.mobile || "",
      row.gender === "male" ? "رجال" : row.gender === "female" ? "نساء" : "",
      row.gift_name || "",
      row.created_at || ""
    ]);
  
    const csv = [
      header.join(","),
      ...csvRows.map(row =>
        row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");
  
    return new Response("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8",
        "Content-Disposition": "attachment; filename=gift-results.csv"
      }
    });
  }