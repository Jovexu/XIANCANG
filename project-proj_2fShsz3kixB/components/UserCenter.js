function UserCenter({ isOpen, onClose, user, onOpenTerms }) {
    if (!isOpen || !user) return null;

    const [invitees, setInvitees] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (isOpen && user.invite_code) {
            loadInvitees();
        }
    }, [isOpen, user]);

    const loadInvitees = async () => {
        setLoading(true);
        try {
            // Find users who were invited by current user's invite_code
            const myCode = user.invite_code;
            
            const { items } = await trickleListObjects('user', 100, true);
            const myInvitees = items
                .filter(u => u.objectData.invited_by === myCode)
                .map(u => ({
                    id: u.objectId,
                    ...u.objectData,
                    joinDate: new Date(u.createdAt).toLocaleDateString()
                }));
            setInvitees(myInvitees);
        } catch (error) {
            console.error("Failed to load invitees", error);
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = () => {
        const code = user.invite_code;
        navigator.clipboard.writeText(code);
        alert("邀请码已复制！");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Sidebar Panel */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 bg-[var(--primary-color)] text-white">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
                        <div className="icon-x text-2xl"></div>
                    </button>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[var(--primary-color)] text-2xl font-bold border-4 border-[var(--accent-color)]">
                            {user.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.phone || user.email.split('@')[0]}</h2>
                            <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                                <div className="icon-coins text-[var(--accent-color)]"></div>
                                <span>余额: <span className="font-bold text-white text-lg">{user.points}</span> 积分</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {/* Invite Section */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="icon-users text-[var(--primary-color)]"></div>
                            专属邀请码
                        </h3>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded border border-blue-100">
                            <p className="text-sm text-gray-600 mb-3">
                                这是您的唯一身份邀请码。好友注册时录入此 6 位数字代码，将自动加入您的人脉圈，双方均可获得 <span className="font-bold text-[var(--accent-color)]">10 积分</span> 奖励！
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded text-center font-mono font-bold tracking-widest text-gray-700 text-lg">
                                    {user.invite_code || '生成中...'}
                                </div>
                                <button onClick={copyInviteCode} className="btn-accent text-sm py-2 px-4">
                                    复制代码
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Relationship Map */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="icon-network text-[var(--primary-color)]"></div>
                            人脉关系图谱 (基于邀请码)
                        </h3>
                        {loading ? (
                            <div className="text-center py-4 text-gray-400">加载中...</div>
                        ) : invitees.length > 0 ? (
                            <div className="relative border-l-2 border-gray-200 ml-3 pl-6 space-y-6 py-2">
                                {invitees.map((invitee, index) => (
                                    <div key={index} className="relative">
                                        {/* Connector dot */}
                                        <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[var(--primary-color)]"></div>
                                        <div className="bg-gray-50 p-3 rounded border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700">{invitee.phone || invitee.email}</p>
                                                <p className="text-xs text-gray-400">注册时间: {invitee.joinDate}</p>
                                            </div>
                                            {invitee.is_inviter_rewarded ? (
                                                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                                    <div className="icon-check w-3 h-3"></div>
                                                    已贡献 10 积分
                                                </div>
                                            ) : (
                                                <div className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1">
                                                    <div className="icon-clock w-3 h-3"></div>
                                                    待充值激活
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
                                <div className="icon-user-plus text-3xl mb-2 opacity-30"></div>
                                <p className="text-sm">暂无邀请记录</p>
                                <p className="text-xs mt-1">快去邀请好友赚取积分吧！</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button onClick={onOpenTerms} className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="icon-file-text text-gray-400"></div>
                                <span className="text-sm font-medium text-gray-700">服务条款与处罚规则</span>
                            </div>
                            <div className="icon-chevron-right text-gray-400 text-sm"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}