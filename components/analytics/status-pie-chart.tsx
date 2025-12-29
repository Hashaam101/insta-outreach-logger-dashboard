"use client"

import * as React from "react"
import { 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';

interface StatusPieChartProps {
    data: { STATUS: string, COUNT: number }[]
}

export function StatusPieChart({ data }: StatusPieChartProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const COLORS = [
        'oklch(0.55 0.18 285)', 
        'oklch(0.55 0.20 270)', // Light Purple
        'oklch(0.45 0.15 310)', // Dark Purple
        'oklch(0.75 0.20 250)', // Blue-ish Purple
        'oklch(0.85 0.15 330)', // Pink-ish Purple
    ];

    const chartData = data.map(item => ({
        name: item.STATUS || 'Unknown',
        value: item.COUNT
    }));

    if (!mounted) {
        return <div className="h-[300px] w-full mt-4 bg-primary/5 animate-pulse rounded-2xl" />
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: 'oklch(0.55 0.18 285)' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-[10px] text-muted-foreground uppercase font-bold">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}