export async function onRequestGet({ request }) {
    const email =
      request.headers.get("cf-access-authenticated-user-email") ||
      request.headers.get("CF-Access-Authenticated-User-Email") ||
      "";
  
    let name = "مستخدم";
  
    if (email) {
      name = email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .trim();
    }
  
    return Response.json({ name, email });
  }