'use server';

import { getActorDetailedStats, getOperatorDetailedStats } from "@/lib/data";

export async function fetchActorPerformance(handle: string) {
    return await getActorDetailedStats(handle);
}

export async function fetchOperatorPerformance(name: string) {
    return await getOperatorDetailedStats(name);
}
