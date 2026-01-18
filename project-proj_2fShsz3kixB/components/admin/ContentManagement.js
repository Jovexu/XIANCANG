function ContentManagement() {
    const [listings, setListings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadListings();
    }, []);

    const loadListings = async () => {
        setLoading(true);
        try {
            // Fetch DB freight listings
            const { items } = await trickleListObjects('freight', 100, true);
            const dbListings = items.map(item => ({
                id: item.objectId,
                source: 'DB',
                ...item.objectData,
                createdAt: new Date(item.createdAt).toLocaleDateString()
            }));

            // In a real scenario, we might merge mock data here if we want to manage it,
            // but usually admin only manages DB data. For demo, we just show DB data.
            setListings(dbListings);
        } catch (error) {
            console.error("Failed to load listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const item = listings.find(l => l.id === id);
            // Reconstruct object data without id/source
            const { id: _, source, createdAt, ...data } = item;
            
            await trickleUpdateObject('freight', id, {
                ...data,
                status: newStatus
            });
            
            setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        } catch (error) {
            console.error("Status update failed:", error);
            alert("状态更新失败");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("确定要删除这条现舱信息吗？")) {
            try {
                await trickleDeleteObject('freight', id);
                setListings(prev => prev.filter(l => l.id !== id));
            } catch (error) {
                console.error("Delete failed:", error);
                alert("删除失败");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">现舱信息列表</h3>
                    <button onClick={loadListings} className="text-slate-500 hover:text-blue-600">
                        <div className="icon-refresh-cw w-4 h-4"></div>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="admin-table-header">起运港 / 目的港</th>
                                <th className="admin-table-header">船东 / 柜型</th>
                                <th className="admin-table-header">价格 (USD)</th>
                                <th className="admin-table-header">状态</th>
                                <th className="admin-table-header">发布时间</th>
                                <th className="admin-table-header text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">加载中...</td>
                                </tr>
                            ) : listings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                                        暂无数据库中的现舱信息 (前台演示数据为 Mock 数据)
                                    </td>
                                </tr>
                            ) : (
                                listings.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="admin-table-cell">
                                            <div className="font-medium text-slate-800">{item.origin}</div>
                                            <div className="text-xs text-slate-500">to {item.destination}</div>
                                        </td>
                                        <td className="admin-table-cell">
                                            <div>{item.carrier}</div>
                                            <div className="text-xs text-slate-500">{item.containerType} * {item.volume}</div>
                                        </td>
                                        <td className="admin-table-cell font-bold text-green-600">
                                            ${item.price}
                                        </td>
                                        <td className="admin-table-cell">
                                            <span className={`badge ${
                                                item.status === 'active' ? 'badge-green' : 
                                                item.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'badge-yellow'
                                            }`}>
                                                {item.status === 'active' ? '已上架' : 
                                                 item.status === 'closed' ? '已下架' : '待审核'}
                                            </span>
                                        </td>
                                        <td className="admin-table-cell text-slate-500 text-xs">
                                            {item.createdAt}
                                        </td>
                                        <td className="admin-table-cell text-right">
                                            {item.status !== 'active' && (
                                                <button 
                                                    onClick={() => handleStatusChange(item.id, 'active')}
                                                    className="text-green-600 hover:text-green-800 mr-3 text-xs font-medium"
                                                >
                                                    通过/上架
                                                </button>
                                            )}
                                            {item.status === 'active' && (
                                                <button 
                                                    onClick={() => handleStatusChange(item.id, 'closed')}
                                                    className="text-orange-600 hover:text-orange-800 mr-3 text-xs font-medium"
                                                >
                                                    下架
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-800"
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
            </div>
        </div>
    );
}