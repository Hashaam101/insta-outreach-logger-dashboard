"use client"

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
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
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
                            const date = new Date(str);
                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                        }}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'var(--card)', 
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="TOTAL" 
                        stroke="var(--primary)" 
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
