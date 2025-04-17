// app/api/excel-export/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(process.env.SUPABASE_EDGE_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify(body),
        });

        const text = await response.text();

        if (!response.ok) {
            return new NextResponse(JSON.stringify({ error: "Edge Function 処理失敗" }), { status: 500 });
        }

        const result = JSON.parse(text);
        return NextResponse.json({ download_url: result.download_url });
    } catch (error) {
        return new NextResponse(JSON.stringify({ error: "内部エラー" }), { status: 500 });
    }
}
