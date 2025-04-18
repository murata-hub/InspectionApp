// supabase/functions/excel_export/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  }
  try {
    const body = await req.json();
    const lambdaRes = await fetch(Deno.env.get("LAMBDA_ENDPOINT"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const lambdaResultText = await lambdaRes.text();
    const lambdaResult = JSON.parse(lambdaResultText);
    console.log(lambdaResult);
    return new Response(JSON.stringify({
      download_url: lambdaResult.download_url
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: "内部エラー",
      details: String(err)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
    });
  }
});
