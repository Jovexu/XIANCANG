function AdminLogin({ onLogin }) {
    const [formData, setFormData] = React.useState({ username: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                        <div className="icon-shield-check text-2xl"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">后台管理系统</h2>
                    <p className="text-slate-500 text-sm mt-2">现舱汇 YICHEN LOGISTICS</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">管理员账号</label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-slate-400">
                                <div className="icon-user"></div>
                            </div>
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Admin Username"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-slate-400">
                                <div className="icon-lock"></div>
                            </div>
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Password"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 transition-colors mt-2">
                        安全登录
                    </button>
                </form>
                
                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2026 YICHEN LOGISTICS Admin Panel
                </div>
            </div>
        </div>
    );
}