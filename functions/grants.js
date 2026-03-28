export async function onRequest() {
    const res = await fetch(
      "https://api.endaoment.org/v1/transfers/grants/fund/1cf2305e-9fd5-4ea1-9eb5-1970ee6bdf17"
    );
  
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
  