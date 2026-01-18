function Footer({ onOpenTerms }) {
    return (
        <footer className="bg-[var(--primary-color)] text-white py-12 mt-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-white text-[var(--primary-color)] flex items-center justify-center rounded-sm">
                                <div className="icon-anchor text-lg"></div>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-white">现舱汇</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            现舱汇 (YICHEN LOGISTICS) 致力于为全球外贸企业提供最透明、最高效的海运舱位匹配服务。连接世界，优化物流。
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">快速链接</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-[var(--accent-color)]">关于我们</a></li>
                            <li>
                                <button onClick={onOpenTerms} className="hover:text-[var(--accent-color)] text-left">
                                    服务条款
                                </button>
                            </li>
                            <li><a href="#" className="hover:text-[var(--accent-color)]">隐私政策</a></li>
                            <li><a href="#" className="hover:text-[var(--accent-color)]">联系客服</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-4 text-white">联系我们</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-center gap-2">
                                <div className="icon-phone h-4 w-4"></div>
                                <span>+86 13450351520</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="icon-mail h-4 w-4"></div>
                                <span>Jove@yclogistics.com.cn</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="icon-map-pin h-4 w-4 flex-shrink-0"></div>
                                <span>中国广东省广州市白云区汇侨路 64 号</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-700 pt-8 text-center text-xs text-gray-500">
                    <p>&copy; 2026 YICHEN LOGISTICS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}