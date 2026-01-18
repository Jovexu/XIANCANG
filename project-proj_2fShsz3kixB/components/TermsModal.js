function TermsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <div className="icon-x"></div>
                </button>
                
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-serif font-bold text-[var(--primary-color)]">服务条款 & 违规处罚细则</h2>
                </div>

                <div className="p-8 overflow-y-auto">
                    <div className="prose prose-sm max-w-none text-gray-600">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">1. 服务内容</h3>
                        <p className="mb-4">
                            现舱汇（以下简称“本平台”）为用户提供国际海运现舱信息的发布与查询服务。用户可以在本平台浏览、搜索、预订舱位，或发布自有的现舱资源。
                        </p>

                        <h3 className="text-lg font-bold text-gray-800 mb-2">2. 积分规则</h3>
                        <ul className="list-disc pl-5 mb-4 space-y-1">
                            <li>新用户注册即赠送 <span className="font-bold text-[var(--accent-color)]">10 积分</span>体验金。</li>
                            <li>每成功邀请一位新用户注册<span className="font-bold text-red-500">并完成首次充值</span>，邀请人将获得 <span className="font-bold text-[var(--accent-color)]">10 积分</span>奖励。</li>
                            <li>发布一条现舱信息需消耗 <span className="font-bold text-[var(--accent-color)]">2 积分</span>。</li>
                            <li>查看一条现舱信息的详细联系方式需消耗 <span className="font-bold text-[var(--accent-color)]">3 积分</span>。</li>
                        </ul>

                        <div className="bg-red-50 border border-red-100 p-4 rounded-md mb-6">
                            <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                                <div className="icon-triangle-alert"></div>
                                3. 虚假信息处罚（特别强调）
                            </h3>
                            <p className="text-red-800 font-medium">
                                为维护平台信息的真实性与交易安全，严禁发布任何虚假舱位、价格或联系方式。
                            </p>
                            <p className="text-red-600 mt-2">
                                凡是被用户举报并经平台核实发布虚假信息者，系统将一次性扣除发布者 <span className="font-bold text-xl">15 积分</span> 作为处罚。
                            </p>
                            <p className="text-red-600 mt-1">
                                情节严重者，平台有权永久封禁其账号。
                            </p>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-2">4. 交易声明</h3>
                        <p className="mb-4">
                            本平台仅作为信息中介，不对海运交易过程中的货损、延误、费用争议等承担法律责任。请交易双方自行核实对方资质，签订正规运输合同。
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 text-right">
                    <button onClick={onClose} className="btn-primary">
                        我已阅读并同意
                    </button>
                </div>
            </div>
        </div>
    );
}