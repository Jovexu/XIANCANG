function UserManagement() {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedUser, setSelectedUser] = React.useState(null); // For edit modal if needed

    React.useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { items } = await trickleListObjects('user', 100, true);
            const formattedUsers = items.map(u => ({
                id: u.objectId,
                ...u.objectData,
                createdAt: new Date(u.createdAt).toLocaleString()
            }));
            setUsers(formattedUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
            alert("加载用户数据失败");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (confirm("确定要删除该用户吗？此操作不可恢复！")) {
            try {
                await trickleDeleteObject('user', userId);
                setUsers(prev => prev.filter(u => u.id !== userId));
                alert("用户已删除");
            } catch (error) {
                console.error("Delete failed:", error);
                alert("删除失败");
            }
        }
    };

    const handleUpdatePoints = async (userId, currentPoints) => {
        const newPointsStr = prompt("请输入新的积分余额:", currentPoints);
        if (newPointsStr === null) return;
        
        const newPoints = parseInt(newPointsStr);
        if (isNaN(newPoints)) {
            alert("请输入有效的数字");
            return;
        }

        try {
            // We need to fetch the full object first or rely on state, 
            // trickleUpdateObject merges? Usually it needs full object in some implementations, 
            // but assuming partial update or we recreate object
            const userToUpdate = users.find(u => u.id === userId);
            if (!userToUpdate) return;
            
            // Construct data to update (exclude system fields like id, createdAt if they are in state)
            const { id, createdAt, ...data } = userToUpdate;
            
            await trickleUpdateObject('user', userId, {
                ...data,
                points: newPoints
            });
            
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: newPoints } : u));
            alert("积分更新成功");
        } catch (error) {
            console.error("Update failed:", error);
            alert("更新失败");
        }
    };

    const filteredUsers = users.filter(user => 
        (user.phone && user.phone.includes(searchTerm)) || 
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.invite_code && user.invite_code.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative max-w-md w-full">
                    <div className="absolute left-3 top-2.5 text-slate-400">
                        <div className="icon-search w-4 h-4"></div>
                    </div>
                    <input 
                        type="text" 
                        placeholder="搜索手机号 / 邮箱 / 邀请码..." 
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded w-full text-sm focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-sm font-medium transition-colors">
                    <div className="icon-refresh-cw w-4 h-4"></div>
                    刷新列表
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">用户ID / 注册时间</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">联系方式</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">积分余额</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">邀请码</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">邀请人</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
                                            加载中...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">暂无用户数据</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-slate-400 font-mono mb-1">#{user.id.slice(-6)}</div>
                                            <div className="text-sm text-slate-500">{user.createdAt}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                {user.phone && (
                                                    <span className="text-sm font-medium text-slate-900 flex items-center gap-1">
                                                        <div className="icon-phone w-3 h-3 text-slate-400"></div>
                                                        {user.phone}
                                                    </span>
                                                )}
                                                {user.email && (
                                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                                        <div className="icon-mail w-3 h-3 text-slate-400"></div>
                                                        {user.email}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.points > 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {user.points || 0} pts
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-xs font-mono bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded">{user.invite_code || '-'}</code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {user.invited_by ? (
                                                <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => setSearchTerm(user.invited_by)}>
                                                    {user.invited_by}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleUpdatePoints(user.id, user.points || 0)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="修改积分"
                                            >
                                                <div className="icon-edit-2 w-4 h-4"></div>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="删除用户"
                                            >
                                                <div className="icon-trash-2 w-4 h-4"></div>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        显示 {filteredUsers.length} 位用户
                    </div>
                </div>
            </div>
        </div>
    );
}