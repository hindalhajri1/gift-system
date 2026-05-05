export async function onRequestGet({ request }) {
    const email = request.headers.get("cf-access-authenticated-user-email") || "";
    const name = email ? email.split("@")[0].replace(/[._-]/g, " ") : "مستخدم";
  
    return Response.json({ name, email });
  }