import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { format } = await request.json();
        const cookieStore = await cookies();
        
        cookieStore.set("time_display_format", format, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year persistence
            sameSite: "lax",
        });

        return NextResponse.json({ success: true });
    } catch (_error) {
        return NextResponse.json({ error: "Failed to save time prefs" }, { status: 500 });
    }
}
