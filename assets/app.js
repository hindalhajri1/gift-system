async function api(url, options = {}) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options
    });
  
    const text = await res.text();
  
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text);
      }
    }
  
    if (!res.ok) {
      throw new Error(data.error || "حدث خطأ في الاتصال بالـ API");
    }
  
    return data;
  }