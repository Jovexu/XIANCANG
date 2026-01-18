function FreightCard({ data, onUnlock, isUnlocked, currentUser, onEdit }) {
    const isCreator = currentUser && data.creator_id === currentUser.objectId;

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 mb-4 relative">
            {isCreator && (
                <button 
                    onClick={() => onEdit(data)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-[var(--primary-color)] p-1"
                    title="编辑我的发布"
                >
                    <div className="icon-pencil text-sm"></div>
                </button>
            )}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Route Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-800">{data.origin}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">CNSHA</span>
                        </div>
                        <div className="flex-1 h-[1px] bg-gray-300 relative min-w-[60px] max-w-[100px]">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                                <div className="icon-ship text-gray-400 text-xs"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-800">{data.destination}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">USLAX</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="icon-container text-gray-400"></div>
                            <span>柜型: <span className="font-medium text-gray-900">{data.containerType}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="icon-box text-gray-400"></div>
                            <span>剩余舱位: <span className="font-medium text-gray-900">{data.volume}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="icon-anchor text-gray-400"></div>
                            <span>船东: <span className="font-medium text-gray-900">{data.carrier}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="icon-calendar-clock text-gray-400"></div>
                            <span>截关: <span className="font-medium text-gray-900">{data.cutoffDate}</span></span>
                        </div>
                    </div>

                    {/* Surcharges Section */}
                    <div className="mt-3 pt-3 border-t border-gray-50 text-xs flex items-start gap-2 bg-slate-50 p-2 rounded">
                        <div className="icon-info w-3 h-3 mt-0.5 text-[var(--accent-color)] flex-shrink-0"></div>
                        <span className="text-gray-500">附加费明细: <span className="text-gray-700 font-medium">{data.surcharges}</span></span>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                    <div className="text-right mb-4">
                        <p className="text-xs text-gray-500 mb-1">运费参考价 (有效期至 {data.validUntil})</p>
                        <div className="text-2xl font-bold text-[var(--accent-color)]">
                            USD {data.price.toLocaleString()}
                        </div>
                    </div>

                    {isCreator ? (
                         <div className="w-full bg-blue-50 border border-blue-200 rounded p-3 text-sm text-center">
                            <span className="text-blue-700 font-bold">我发布的现舱</span>
                        </div>
                    ) : (
                        isUnlocked ? (
                            <div className="w-full bg-green-50 border border-green-200 rounded p-3 text-sm">
                                <div className="font-bold text-green-800 flex items-center gap-2 mb-1">
                                    <div className="icon-circle-check"></div>
                                    <span>已解锁联系方式</span>
                                </div>
                                <div className="text-gray-700">联系人: {data.provider}</div>
                                <div className="text-gray-700 font-medium">{data.providerContact}</div>
                            </div>
                        ) : (
                            data.volume <= 0 ? (
                                <button 
                                    disabled
                                    className="w-full bg-gray-200 text-gray-400 cursor-not-allowed text-sm py-2 rounded font-bold flex items-center justify-center gap-2"
                                >
                                    <div className="icon-ban"></div>
                                    舱位已售罄
                                </button>
                            ) : (
                                <button 
                                    onClick={() => onUnlock(data)}
                                    className="btn-primary w-full text-sm py-2 group"
                                >
                                    <span>订舱确认</span>
                                    <div className="bg-yellow-500 text-white text-[10px] px-1.5 rounded-full ml-2 flex items-center">
                                        <div className="icon-lock w-3 h-3 mr-0.5"></div>
                                        3 积分
                                    </div>
                                </button>
                            )
                        )
                    )}
                </div>
            </div>
        </div>
    );
}