import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Icon } from '@/Components/UI';

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const stats = usePage().props.stats || {};

    const statCards = [
        { label: 'Total Donations', value: stats.totalDonations || 0, icon: 'donation', color: 'blue', trend: '+12%', trendPositive: true },
        { label: 'Active Requests', value: stats.activeRequests || 0, icon: 'request', color: 'green', trend: '+5%', trendPositive: true },
        { label: 'Matches Made', value: stats.matchesMade || 0, icon: 'match', color: 'orange', trend: '+8%', trendPositive: true },
        { label: 'Completed', value: stats.completed || 0, icon: 'check', color: 'purple', trend: '+3%', trendPositive: true },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Welcome back, {user.name}</p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {/* Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="stat-card">
                            <div className={`stat-card-icon ${stat.color}`}>
                                <Icon name={stat.icon} size={24} />
                            </div>
                            <div className="stat-card-value">{stat.value.toLocaleString()}</div>
                            <div className="stat-card-label">{stat.label}</div>
                            <div className={`stat-card-trend ${stat.trendPositive ? 'positive' : 'negative'}`}>
                                <Icon name={stat.trendPositive ? 'arrow' : 'arrow'} size={12} className={stat.trendPositive ? '' : 'rotate-180'} />
                                <span>{stat.trend}</span>
                                <span className="text-gray-500">vs last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity & Quick Actions */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 card card-lg">
                        <div className="card-header">
                            <h3 className="card-title">Recent Activity</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { type: 'donation', title: 'New donation received', desc: 'John donated 50 food packs', time: '2 hours ago', icon: 'donation', color: 'blue' },
                                { type: 'request', title: 'Support request submitted', desc: 'Maria requested textbooks', time: '4 hours ago', icon: 'request', color: 'green' },
                                { type: 'match', title: 'Match confirmed', desc: 'Food packs matched with shelter', time: '6 hours ago', icon: 'match', color: 'orange' },
                                { type: 'approval', title: 'Request approved', desc: 'Clothing request verified', time: '8 hours ago', icon: 'approvals', color: 'purple' },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                                    <div className={`p-2.5 rounded-xl bg-${activity.color}-100 text-${activity.color}-600 shrink-0`}>
                                        <Icon name={activity.icon} size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{activity.title}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{activity.desc}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card card-lg">
                        <div className="card-header">
                            <h3 className="card-title">Quick Actions</h3>
                        </div>
                        <div className="space-y-3">
                            <a href="/donate" className="btn btn-primary w-full justify-start gap-3">
                                <Icon name="plus" size={20} />
                                <span>Make a Donation</span>
                            </a>
                            <a href="/request-help" className="btn btn-success w-full justify-start gap-3">
                                <Icon name="request" size={20} />
                                <span>Request Help</span>
                            </a>
                            <a href="/donations" className="btn btn-secondary w-full justify-start gap-3">
                                <Icon name="donation" size={20} />
                                <span>View Donations</span>
                            </a>
                            <a href="/requests" className="btn btn-secondary w-full justify-start gap-3">
                                <Icon name="request" size={20} />
                                <span>View Requests</span>
                            </a>
                            <a href="/matches" className="btn btn-secondary w-full justify-start gap-3">
                                <Icon name="match" size={20} />
                                <span>View Matches</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}