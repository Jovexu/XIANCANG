function Header({ user, onLoginClick, onRegisterClick, onLogout, onRechargeClick, onPublishClick, notifications, onMarkNotifRead }) {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 h-20">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
                    <div className="w-10 h-10 bg-[var(--primary-color)] text-[var(--accent-color)] flex items-center justify-center rounded-sm">
                        <div className="icon-anchor text-2xl"></div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight leading-none text-[var(--primary-color)]">现舱汇</h1>
                        <p className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase">YICHEN LOGISTICS</p>
                    </div>
                </div>

                {/* Navigation / User Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                    {user ? (
                        <div className="flex items-center gap-4 md:gap-6">
                            <button onClick={onPublishClick} className="hidden md:flex btn-outline text-sm py-1.5 px-4 gap-2 border-dashed hover:border-solid">
                                <div className="icon-plus text-xs"></div>
                                发布现舱
                            </button>

                            <NotificationDropdown notifications={notifications} onMarkAsRead={onMarkNotifRead} />

                            <div className="h-8 w-[1px] bg-gray-200"></div>

                            <div className="flex flex-col items-end min-w-[80px] cursor-pointer group" onClick={window.openUserCenter}>
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium text-[var(--primary-color)] group-hover:underline">{user.phone || user.email.split('@')[0]}</span>
                                    <div className="icon-chevron-down text-xs text-gray-400"></div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[var(--accent-color)] font-bold cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); onRechargeClick(); }}>
                                    <div className="icon-coins text-xs"></div>
                                    <span>{user.points} 积分</span>
                                    <div className="icon-plus-circle text-xs ml-0.5"></div>
                                </div>
                            </div>
                            
                            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors" title="退出登录">
                                <div className="icon-log-out"></div>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button onClick={onLoginClick} className="text-[var(--primary-color)] font-medium hover:text-[var(--accent-color)] transition-colors px-4 py-2">
                                登录
                            </button>
                            <button onClick={onRegisterClick} className="btn-primary text-sm">
                                注册
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
