// supabase/functions/excel_export/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
    try {
        const body = await req.json();
        // console.log("📦 フロントから受け取ったデータ:", body);

        const lambdaRes = await fetch(Deno.env.get("LAMBDA_ENDPOINT")!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        // console.log("🔁 Lambdaレスポンスステータス:", lambdaRes.status);
        const lambdaResultText = await lambdaRes.text();  // 生文字列として受け取る
        // console.log("📦 Lambdaからの生レスポンス:", lambdaResultText);

        const lambdaResult = JSON.parse(lambdaResultText);  // ここでパースする
        // console.log("✅ パース後のdownload_url:", lambdaResult.download_url);

        return new Response(JSON.stringify({ download_url: lambdaResult.download_url }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });


    } catch (err) {
        // console.error("❗Edge Function内部エラー:", err);
        return new Response(JSON.stringify({ error: "内部エラー", details: String(err) }), { status: 500 });
    }
});
