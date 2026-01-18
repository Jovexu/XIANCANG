function PublishModal({ isOpen, onClose, onPublish, initialData }) {
    if (!isOpen) return null;

    const isEditMode = !!initialData;
    const [formData, setFormData] = React.useState({
        origin: '',
        destination: '',
        price: '',
        volume: '',
        containerType: '40HQ',
        carrier: '',
        cutoffDate: '',
        surcharges: ''
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                origin: initialData.origin || '',
                destination: initialData.destination || '',
                price: initialData.price || '',
                volume: initialData.volume || '',
                containerType: initialData.containerType || '40HQ',
                carrier: initialData.carrier || '',
                cutoffDate: initialData.cutoffDate || '',
                surcharges: initialData.surcharges || ''
            });
        } else {
            setFormData({
                origin: '',
                destination: '',
                price: '',
                volume: '',
                containerType: '40HQ',
                carrier: '',
                cutoffDate: '',
                surcharges: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // If edit mode, pass id back. If new, id is generated or handled by caller (but we pass data structure)
        const submitData = {
            ...formData,
            surcharges: formData.surcharges || 'ALL IN',
            // If editing, preserve original ID and other fields not in form
            ...(isEditMode ? { id: initialData.id, objectId: initialData.objectId } : {})
        };
        
        onPublish(submitData, isEditMode);
        // Do not close immediately here, let app.js handle closing after confirmation/success if needed
        // But current architecture expects closing here or controlled from outside. 
        // We will keep onClose here but app.js confirmation logic runs before this? 
        // No, app.js handlePublish will be called. We should wait for it? 
        // Simple way: App.js handles logic. We just trigger callback. 
        // If app.js logic fails/cancels, we might want to keep modal open. 
        // For simplicity, we assume success or handle re-opening.
        // Actually, better to remove onClose() here and let parent close it on success.
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <div className="icon-x"></div>
                </button>
                
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center">
                            <div className={isEditMode ? "icon-pencil text-xl" : "icon-plus text-xl"}></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-[var(--primary-color)]">
                                {isEditMode ? '修改现舱信息' : '发布现舱信息'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? '修改您的舱位详情' : '填写详细信息以发布您的舱位'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">起运港 (Origin)</label>
                            <input 
                                type="text" 
                                required
                                className="input-field" 
                                placeholder="例如: Shanghai"
                                value={formData.origin}
                                onChange={e => setFormData({...formData, origin: e.target.value})}
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">目的港 (Destination)</label>
                            <input 
                                type="text" 
                                required
                                className="input-field" 
                                placeholder="例如: Los Angeles"
                                value={formData.destination}
                                onChange={e => setFormData({...formData, destination: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">运费 (USD)</label>
                            <input 
                                type="number" 
                                required
                                className="input-field" 
                                placeholder="例如: 1200"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">船东 (Carrier)</label>
                            <select 
                                className="input-field"
                                value={formData.carrier}
                                onChange={e => setFormData({...formData, carrier: e.target.value})}
                            >
                                <option value="">选择船东</option>
                                <option value="Maersk">Maersk</option>
                                <option value="MSC">MSC</option>
                                <option value="COSCO">COSCO</option>
                                <option value="CMA CGM">CMA CGM</option>
                                <option value="ONE">ONE</option>
                                <option value="Evergreen">Evergreen</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">柜型</label>
                            <select 
                                className="input-field"
                                value={formData.containerType}
                                onChange={e => setFormData({...formData, containerType: e.target.value})}
                            >
                                <option value="20GP">20GP</option>
                                <option value="40GP">40GP</option>
                                <option value="40HQ">40HQ</option>
                                <option value="45HQ">45HQ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">剩余舱位</label>
                            <input 
                                type="number" 
                                required
                                className="input-field" 
                                placeholder="数量"
                                value={formData.volume}
                                onChange={e => setFormData({...formData, volume: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">截关日期</label>
                            <input 
                                type="date" 
                                required
                                className="input-field" 
                                value={formData.cutoffDate}
                                onChange={e => setFormData({...formData, cutoffDate: e.target.value})}
                            />
                        </div>
                        
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">附加费明细</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="例如: THC:¥1100, DOC:¥500..."
                                value={formData.surcharges}
                                onChange={e => setFormData({...formData, surcharges: e.target.value})}
                            />
                        </div>

                        <div className="col-span-2 mt-4 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                                取消
                            </button>
                            <button type="submit" className="btn-primary">
                                {isEditMode ? '保存修改' : '立即发布'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}