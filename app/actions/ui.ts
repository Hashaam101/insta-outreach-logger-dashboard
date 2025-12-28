'use server';

import { cookies } from "next/headers";

export async function setViewCookie(view: string) {
    const cookieStore = await cookies();
    cookieStore.set("dashboard_view", view, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax"
    });
}
