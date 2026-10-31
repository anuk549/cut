export const secureJson = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });

export const secureRedirect = (url: string, status = 303) =>
  new Response(null, {
    status,
    headers: {
      Location: url,
      "Cache-Control": "no-store",
    },
  });
