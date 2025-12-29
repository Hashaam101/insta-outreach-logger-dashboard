import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const cookieStore = await cookies();
        
        cookieStore.set("operator_display_prefs", JSON.stringify(body), {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year persistence
            sameSite: "lax",
        });

        return NextResponse.json({ success: true });
    } catch (_error) {
        return NextResponse.json({ error: "Failed to save prefs" }, { status: 500 });
    }
}
