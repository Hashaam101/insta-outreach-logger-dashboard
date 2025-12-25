"use client"

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

interface PerformanceChartProps {
    data: { NAME: string, TOTAL: number }[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    const COLORS = ['var(--primary)', 'oklch(0.55 0.20 270)', 'oklch(0.45 0.15 310)', 'oklch(0.75 0.20 250)'];

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} hide />
                    <YAxis 
                        dataKey="NAME" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                        width={80}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ 
                            backgroundColor: 'var(--card)', 
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Bar dataKey="TOTAL" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
