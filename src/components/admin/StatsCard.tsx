interface StatsCardProps {
    title: string
    value: string | number
    icon: string
    trend?: string
    color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

export function StatsCard({ title, value, icon, trend, color = 'blue' }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
                {trend && (
                    <span className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
    )
}
