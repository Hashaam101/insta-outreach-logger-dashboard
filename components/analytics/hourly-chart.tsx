"use client"

import * as React from "react"
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';

interface HourlyChartProps {
    data: { HOUR: string, TOTAL: number }[]
}

export function HourlyActivityChart({ data }: HourlyChartProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Ensure all 24 hours are represented
    const fullData = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        const match = data.find(d => d.HOUR === hour);
        return {
            HOUR: `${hour}:00`,
            TOTAL: match ? match.TOTAL : 0
        };
    });

    if (!mounted) {
        return <div className="h-[200px] w-full mt-4 bg-primary/5 animate-pulse rounded-2xl" />
    }

    return (
        <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fullData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="HOUR" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
                        interval={3}
                    />
                    <YAxis hide />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '10px',
                            color: '#fff'
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        itemStyle={{ color: 'oklch(0.55 0.18 285)' }}
                    />
                    <Bar dataKey="TOTAL" radius={[2, 2, 0, 0]}>
                        {fullData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.TOTAL > 0 ? 'oklch(0.55 0.18 285)' : 'rgba(255,255,255,0.05)'} 
                                fillOpacity={0.6 + (entry.TOTAL / Math.max(...fullData.map(d => d.TOTAL || 1))) * 0.4}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}