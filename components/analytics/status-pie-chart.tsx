"use client"

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
    const COLORS = [
        'var(--primary)', 
        'oklch(0.55 0.20 270)', // Light Purple
        'oklch(0.45 0.15 310)', // Dark Purple
        'oklch(0.75 0.20 250)', // Blue-ish Purple
        'oklch(0.85 0.15 330)', // Pink-ish Purple
    ];

    const chartData = data.map(item => ({
        name: item.STATUS || 'Unknown',
        value: item.COUNT
    }));

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
                            backgroundColor: 'var(--card)', 
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
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
