function Dashboard() {
    const [stats, setStats] = React.useState({
        totalUsers: 0,
        totalFreight: 0,
        todayVisits: 142, // Mock
        pendingAudit: 0
    });

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Count users
            const users = await trickleListObjects('user', 100, true);
            
            // Count freight (mock data + DB data if any)
            // Since we mostly use mock data for freight in frontend, this might be 0 for DB
            const freights = await trickleListObjects('freight', 100, true);

            setStats(prev => ({
                ...prev,
                totalUsers: users.items.length,
                totalFreight: freights.items.length + 50, // +50 mock items
                pendingAudit: freights.items.filter(f => f.objectData.status === 'audit_pending').length
            }));
        } catch (error) {
            console.error("Load stats failed", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="admin-card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <div className="icon-users text-xl"></div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">总用户数</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers}</h3>
                    </div>
                </div>

                <div className="admin-card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <div className="icon-ship text-xl"></div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">现舱资源</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.totalFreight}</h3>
                    </div>
                </div>

                <div className="admin-card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <div className="icon-clipboard-list text-xl"></div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">待审核</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.pendingAudit}</h3>
                    </div>
                </div>

                <div className="admin-card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <div className="icon-eye text-xl"></div>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">今日访问</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.todayVisits}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Section (Mock) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">用户增长趋势</h3>
                    <div className="h-64 bg-slate-50 rounded flex items-end justify-between p-4 px-8">
                        {[40, 65, 50, 80, 95, 120, 150].map((h, i) => (
                            <div key={i} className="w-8 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity relative group" style={{ height: `${h/2}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400 px-2">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">热门航线分布</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Shanghai -> Los Angeles', percent: 35, color: 'bg-blue-500' },
                            { name: 'Ningbo -> Rotterdam', percent: 25, color: 'bg-indigo-500' },
                            { name: 'Shenzhen -> Hamburg', percent: 20, color: 'bg-purple-500' },
                            { name: 'Qingdao -> Dubai', percent: 15, color: 'bg-orange-500' },
                            { name: 'Others', percent: 5, color: 'bg-slate-300' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{item.name}</span>
                                    <span className="font-bold text-slate-800">{item.percent}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}