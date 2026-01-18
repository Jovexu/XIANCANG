function FreightList({ results, title, unlockedItems, onUnlockItem, currentUser, onEditItem }) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 20;
    
    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(results.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 500, behavior: 'smooth' }); // Scroll to top of list
    };

    if (results.length === 0) {
        return (
            <div className="py-20 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="icon-ship text-6xl text-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-medium text-gray-900">暂无相关运费信息</h3>
                <p className="text-gray-500 mt-2">请尝试搜索其他港口或航线</p>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-800">
                    {title || "搜索结果"} <span className="text-sm font-sans font-normal text-gray-500 ml-2">({results.length} 条数据)</span>
                </h2>
                <div className="text-sm text-gray-500">
                    {title ? "最新发布优先" : "价格由低到高排列"}
                </div>
            </div>

            <div className="space-y-4">
                {currentItems.map(item => (
                    <FreightCard 
                        key={item.id} 
                        data={item} 
                        isUnlocked={unlockedItems.includes(item.id)}
                        onUnlock={onUnlockItem}
                        currentUser={currentUser}
                        onEdit={onEditItem}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-10 gap-2">
                    <button 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                    >
                        上一页
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-10 h-10 rounded border flex items-center justify-center ${
                                currentPage === i + 1 
                                    ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' 
                                    : 'bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
                    >
                        下一页
                    </button>
                </div>
            )}
        </div>
    );
}