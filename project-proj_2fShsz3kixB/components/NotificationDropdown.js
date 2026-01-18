function NotificationDropdown({ notifications, onMarkAsRead }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-[var(--primary-color)] transition-colors"
            >
                <div className="icon-bell text-xl"></div>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl z-50 border border-gray-100 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-sm text-gray-700">通知提醒</h3>
                            {unreadCount > 0 && (
                                <button onClick={onMarkAsRead} className="text-xs text-[var(--accent-color)] hover:underline">
                                    全部已读
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">
                                    暂无新通知
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.read ? 'bg-gray-300' : 'bg-[var(--accent-color)]'}`}></div>
                                            <div>
                                                <p className="text-sm text-gray-800 mb-1">{notif.message}</p>
                                                <p className="text-xs text-gray-400">{notif.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}