"use client"

import * as React from "react"
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

interface VolumeChartProps {
    data: { LOG_DATE: string, TOTAL: number }[]
}

export function VolumeChart({ data }: VolumeChartProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-[300px] w-full mt-4 bg-primary/5 animate-pulse rounded-2xl" />
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.55 0.18 285)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="oklch(0.55 0.18 285)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="LOG_DATE" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                        minTickGap={30}
                        tickFormatter={(str) => {
                            try {
                                const parts = str.split('-');
                                if (parts.length >= 3) {
                                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    const monthIdx = parseInt(parts[1], 10) - 1;
                                    return `${months[monthIdx]} ${parseInt(parts[2], 10)}`;
                                }
                                return str;
                            } catch {
                                return str;
                            }
                        }}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: 'oklch(0.55 0.18 285)' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="TOTAL" 
                        stroke="oklch(0.55 0.18 285)" 
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}