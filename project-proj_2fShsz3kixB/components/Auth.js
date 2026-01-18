function AuthModal({ isOpen, onClose, type, onSwitchType, onLoginSuccess }) {
    if (!isOpen) return null;

    const [step, setStep] = React.useState('input'); // input, verify
    const [formData, setFormData] = React.useState({
        phone: '',
        email: '',
        password: '',
        inviteCode: '', // Added invite code
        code: ''
    });
    const [loading, setLoading] = React.useState(false);

    const handleSendCode = () => {
        if (!formData.email) {
            alert("请输入邮箱地址以接收验证码");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert(`验证码已发送至 ${formData.email} (模拟验证码: 1234)`);
            setStep('verify');
        }, 1500);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.code !== '1234') {
            alert("验证码错误 (请使用 1234)");
            return;
        }
        
        setLoading(true);
        try {
            // Check if user exists (Simple client-side check for MVP)
            const { items } = await trickleListObjects('user', 100, true);
            const exists = items.find(u => 
                (u.objectData.email && u.objectData.email === formData.email) || 
                (u.objectData.phone && u.objectData.phone === formData.phone)
            );
            
            if (exists) {
                alert("该手机号或邮箱已被注册");
                setLoading(false);
                return;
            }

            // Handle Inviter Validation
            let inviteRewardPoints = 10; // New user gets 10 points
            let validInviterCode = '';

            if (formData.inviteCode) {
                // Look up inviter by invite_code
                const inviter = items.find(u => u.objectData.invite_code === formData.inviteCode);
                if (inviter) {
                    validInviterCode = formData.inviteCode;
                    // Note: Inviter reward is now deferred until this user recharges
                }
            }

            // Generate unique 6-digit invite code (Random 6-digit number)
            // In a production app, we should check for collisions, but for this demo random is sufficient
            const myInviteCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Create user in DB
            const newUser = await trickleCreateObject('user', {
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                points: inviteRewardPoints, // Initial points
                invite_code: myInviteCode,
                address_code: '', // Deprecated, keep empty
                invited_by: validInviterCode,
                is_inviter_rewarded: false, // Default to false
                payment_method: ''
            });

            alert(`注册成功！\n您的专属邀请码是：${myInviteCode}\n获得 10 积分体验金。`);

            // Simulate registration success
            onLoginSuccess({
                ...newUser.objectData,
                objectId: newUser.objectId
            });
            onClose();
        } catch (error) {
            console.error("Registration error:", error);
            alert("注册失败，请稍后重试");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Find user in DB
            const { items } = await trickleListObjects('user', 100, true);
            // In a real app, this filtering should happen on backend
            const user = items.find(u => 
                (u.objectData.email === formData.email || u.objectData.phone === formData.email) && 
                u.objectData.password === formData.password
            );

            if (user) {
                onLoginSuccess({
                    ...user.objectData,
                    objectId: user.objectId
                });
                onClose();
            } else {
                alert("账号或密码错误");
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("登录失败，请检查网络或稍后重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <div className="icon-x"></div>
                </button>
                
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-serif font-bold text-[var(--primary-color)]">
                            {type === 'login' ? '账号登录' : '注册新用户'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">欢迎来到 YICHEN LOGISTICS</p>
                    </div>

                    {type === 'register' && step === 'input' && (
                        <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
                                <input 
                                    type="tel" 
                                    required
                                    className="input-field" 
                                    placeholder="请输入手机号"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                                <input 
                                    type="email" 
                                    required
                                    className="input-field" 
                                    placeholder="用于接收验证码"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">设置密码</label>
                                <input 
                                    type="password" 
                                    required
                                    className="input-field" 
                                    placeholder="6-20位字符"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">邀请码 (选填)</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="如有邀请码，请输入"
                                    value={formData.inviteCode}
                                    onChange={e => setFormData({...formData, inviteCode: e.target.value})}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                                {loading ? '发送中...' : '发送验证码'}
                            </button>
                        </form>
                    )}

                    {type === 'register' && step === 'verify' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 mb-4">
                                验证码已发送至 {formData.email}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">请输入验证码</label>
                                <input 
                                    type="text" 
                                    required
                                    className="input-field text-center tracking-widest text-xl" 
                                    placeholder="----"
                                    maxLength="4"
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value})}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-accent w-full mt-6">
                                {loading ? '注册中...' : '完成注册'}
                            </button>
                            <button type="button" onClick={() => setStep('input')} className="w-full text-center text-sm text-gray-500 mt-2">
                                返回修改信息
                            </button>
                        </form>
                    )}

                    {type === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">账号 (手机/邮箱)</label>
                                <input 
                                    type="text" 
                                    required
                                    className="input-field" 
                                    placeholder="请输入账号"
                                    value={formData.email} // Reusing email field for login input
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                                <input 
                                    type="password" 
                                    required
                                    className="input-field" 
                                    placeholder="请输入密码"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                                {loading ? '登录中...' : '立即登录'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-600">
                            {type === 'login' ? '还没有账号？' : '已有账号？'}
                            <button 
                                onClick={onSwitchType}
                                className="font-bold text-[var(--primary-color)] ml-1 hover:underline"
                            >
                                {type === 'login' ? '立即注册' : '去登录'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}