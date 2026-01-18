// Important: DO NOT remove this `ErrorBoundary` component.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">系统错误</h1>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">刷新页面</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminApp() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('users'); // users, settings, dashboard

  // Simple session check simulation
  React.useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) setIsAdminLoggedIn(true);
  }, []);

  const handleLogin = (credentials) => {
    // Hardcoded admin for demo
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
        setIsAdminLoggedIn(true);
        localStorage.setItem('admin_session', 'true');
    } else {
        alert('账号或密码错误 (默认: admin / admin123)');
    }
  };

  const handleLogout = () => {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('admin_session');
  };

  if (!isAdminLoggedIn) {
      return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
        <AdminSidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onLogout={handleLogout}
        />
        
        <main className="flex-1 ml-[260px] p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {activeTab === 'dashboard' && '仪表盘'}
                        {activeTab === 'users' && '用户管理'}
                        {activeTab === 'content' && '内容审核'}
                        {activeTab === 'settings' && '系统设置'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">欢迎回来，管理员</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">Admin User</p>
                        <p className="text-xs text-slate-400">Super Administrator</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <div className="icon-user text-slate-500"></div>
                    </div>
                </div>
            </header>

            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'content' && <ContentManagement />}
            {activeTab === 'settings' && <SystemSettings />}
        </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);