function AdminSidebar({ activeTab, onTabChange, onLogout }) {
    const menuItems = [
        { id: 'dashboard', label: '仪表盘', icon: 'icon-layout-dashboard' },
        { id: 'users', label: '用户管理', icon: 'icon-users' },
        { id: 'content', label: '内容审核', icon: 'icon-file-text' },
        { id: 'settings', label: '系统设置', icon: 'icon-settings' },
    ];

    return (
        <aside className="admin-sidebar">
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white">
                        <div className="icon-anchor text-lg"></div>
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg tracking-tight">现舱汇 ADMIN</h1>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                            activeTab === item.id 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <div className={`${item.icon} text-lg`}></div>
                        <span className="font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                >
                    <div className="icon-log-out"></div>
                    <span className="font-medium">退出登录</span>
                </button>
            </div>
        </aside>
    );
}