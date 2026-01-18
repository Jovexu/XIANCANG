function SystemSettings() {
    const [settings, setSettings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { items } = await trickleListObjects('system_settings', 100, true);
            setSettings(items.map(item => ({
                id: item.objectId,
                ...item.objectData
            })));
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (id, newValue) => {
        try {
            const setting = settings.find(s => s.id === id);
            const { id: _, ...data } = setting;
            
            await trickleUpdateObject('system_settings', id, {
                ...data,
                setting_value: newValue
            });
            
            setSettings(prev => prev.map(s => s.id === id ? { ...s, setting_value: newValue } : s));
            alert("设置已保存");
        } catch (error) {
            console.error("Save failed:", error);
            alert("保存失败");
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="icon-sliders-horizontal"></div>
                    系统参数配置
                </h3>

                {loading ? (
                    <div className="text-center py-10">加载中...</div>
                ) : (
                    <div className="space-y-6">
                        {settings.map(setting => (
                            <div key={setting.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-50 rounded border border-slate-100">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        {setting.setting_key}
                                    </label>
                                    <p className="text-xs text-slate-500">{setting.description}</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <input 
                                        type="text" 
                                        className="flex-1 md:w-64 px-3 py-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:outline-none"
                                        defaultValue={setting.setting_value}
                                        onBlur={(e) => {
                                            if (e.target.value !== setting.setting_value) {
                                                handleSave(setting.id, e.target.value);
                                            }
                                        }}
                                    />
                                    <button className="text-blue-600 hover:text-blue-800 text-xs whitespace-nowrap hidden md:block">
                                        自动保存
                                    </button>
                                </div>
                            </div>
                        ))}

                        {settings.length === 0 && (
                            <div className="text-center text-slate-400 py-4">
                                暂无配置项，请联系开发人员初始化数据库
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}