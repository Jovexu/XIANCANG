function RechargeModal({ isOpen, onClose, onRecharge }) {
    if (!isOpen) return null;

    const [step, setStep] = React.useState('amount'); // amount, payment
    const [amount, setAmount] = React.useState(150);

    const handleNext = (e) => {
        e.preventDefault();
        if (amount < 150) {
            alert("最低充值金额为 150 元");
            return;
        }
        setStep('payment');
    };

    const handleConfirmPayment = () => {
        // In real app, this would verify payment with backend
        onRecharge(parseInt(amount));
        onClose();
        // Reset state after closing animation (timeout not needed here for simple logic)
        setStep('amount');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <div className="icon-x"></div>
                </button>
                
                <div className="p-8">
                    <h2 className="text-2xl font-serif font-bold text-[var(--primary-color)] mb-2">积分充值</h2>
                    <p className="text-sm text-gray-500 mb-6">1 元 = 1 积分，用于查看现舱联系方式</p>
                    
                    {step === 'amount' ? (
                        <form onSubmit={handleNext}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">充值金额 (元)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">¥</span>
                                    <input 
                                        type="number" 
                                        min="150"
                                        className="input-field pl-8 text-lg font-bold text-[var(--primary-color)]" 
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                                    <div className="icon-info w-3 h-3"></div>
                                    最低充值 150 元
                                </p>
                            </div>

                            <button type="submit" className="btn-primary w-full text-lg mt-8">
                                下一步：扫码支付
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="bg-green-50 border border-green-100 p-4 rounded-lg mb-6 w-full text-center">
                                <p className="text-sm text-gray-600 mb-1">应付金额</p>
                                <p className="text-3xl font-bold text-green-600">¥ {amount}.00</p>
                            </div>

                            <div className="w-48 h-48 bg-gray-100 mb-4 overflow-hidden rounded-lg relative group">
                                <img 
                                    src="https://app.trickle.so/storage/public/images/usr_1a471642f0000001/525a5b45-b2e8-47e3-8991-5a23b9800e5b.jpeg" 
                                    alt="WeChat Pay QR Code"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="icon-scan text-4xl text-white drop-shadow-lg"></div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                                <div className="icon-message-circle text-green-500"></div>
                                请使用微信扫一扫支付
                            </p>

                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setStep('amount')}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 text-sm"
                                >
                                    返回修改
                                </button>
                                <button 
                                    onClick={handleConfirmPayment}
                                    className="flex-1 btn-accent text-sm"
                                >
                                    我已支付
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
