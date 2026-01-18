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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [user, setUser] = React.useState(null);
  const [authModal, setAuthModal] = React.useState({ isOpen: false, type: 'login' });
  const [rechargeModalOpen, setRechargeModalOpen] = React.useState(false);
  const [publishModalOpen, setPublishModalOpen] = React.useState(false);
  const [editingFreight, setEditingFreight] = React.useState(null); // Data for the freight being edited
  const [userCenterOpen, setUserCenterOpen] = React.useState(false);
  const [termsModalOpen, setTermsModalOpen] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState([]);
  const [hasSearched, setHasSearched] = React.useState(false); // Used to toggle between "Latest" and "Search Results" view modes visually if needed, though here we just use it to show list
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [unlockedItems, setUnlockedItems] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);

  // Expose User Center opener to window for Header to call (simpler prop drill alternative)
  React.useEffect(() => {
      window.openUserCenter = () => setUserCenterOpen(true);
  }, []);

  // Load initial data (optional) or checking local storage
  React.useEffect(() => {
    // Load 20 latest items initially
    // Sort by ID descending to simulate "latest" since mock IDs are sequential
    const latest = [...MOCK_FREIGHT_DATA]
        .sort((a, b) => {
             const idA = parseInt(a.id.replace('FR-', ''));
             const idB = parseInt(b.id.replace('FR-', ''));
             return idB - idA;
        })
        .slice(0, 20);
    
    setSearchResults(latest);
    setHasSearched(true);
  }, []);

  const handleSearch = ({ origin, destination }) => {
    // Simulate API search with filters
    let results = [...MOCK_FREIGHT_DATA];
    
    if (origin) {
        results = results.filter(item => item.origin.toLowerCase().includes(origin.toLowerCase()));
    }
    if (destination) {
        results = results.filter(item => item.destination.toLowerCase().includes(destination.toLowerCase()));
    }
    
    // If no specific search, return all (or handling empty state)
    if (!origin && !destination) {
       results = MOCK_FREIGHT_DATA; 
    }

    setSearchResults(results);
    setHasSearched(true);
    setIsInitialLoad(false);
  };

  const handleUnlockItem = async (item) => {
    if (!user) {
        setAuthModal({ isOpen: true, type: 'login' });
        return;
    }

    if (user.points < 3) {
        alert("积分不足，请充值！需要 3 积分，当前余额 " + user.points);
        setRechargeModalOpen(true);
        return;
    }

    if (confirm(`确认支付 3 积分查看该舱位联系方式?`)) {
        try {
            const newPoints = user.points - 3;
            // Prepare data for update, excluding objectId which is a meta field
            const { objectId, ...userData } = user;
            const updatedUserData = { ...userData, points: newPoints };
            
            await trickleUpdateObject('user', objectId, updatedUserData);
            
            setUser(prev => ({ ...prev, points: newPoints }));
            setUnlockedItems(prev => [...prev, item.id]);
            
            // Add Notification to simulating "Provider gets notified"
            const newNotification = {
                id: Date.now(),
                message: `您的舱位 ${item.origin} - ${item.destination} 已被客户订舱解锁`,
                time: '刚刚',
                read: false
            };
            setNotifications(prev => [newNotification, ...prev]);

            alert("解锁成功！");
        } catch (error) {
            console.error("Unlock transaction error:", error);
            alert("支付失败，请稍后重试");
        }
    }
  };

  const handleRecharge = async (amount) => {
    try {
        const newPoints = (user.points || 0) + amount;
        
        const { objectId, ...userData } = user;
        let updatedUserData = { ...userData, points: newPoints };
        
        // Check for deferred invitation reward
        let rewardMessage = "";
        if (user.invited_by && !user.is_inviter_rewarded) {
            // Find inviter by invite_code
            const { items } = await trickleListObjects('user', 100, true);
            const inviter = items.find(u => u.objectData.invite_code === user.invited_by);
            
            if (inviter) {
                // Reward inviter
                const newInviterPoints = (inviter.objectData.points || 0) + 10;
                const { objectId: inviterId, ...inviterData } = inviter.objectData;
                
                await trickleUpdateObject('user', inviter.objectId, {
                    ...inviterData,
                    points: newInviterPoints
                });
                
                // Mark user as having rewarded the inviter
                updatedUserData.is_inviter_rewarded = true;
                rewardMessage = " (邀请人已获得 10 积分奖励)";
                console.log(`Inviter ${inviter.objectId} rewarded 10 points after recharge.`);
            }
        }

        await trickleUpdateObject('user', objectId, updatedUserData);
        
        setUser(prev => ({ ...prev, ...updatedUserData }));
        alert(`充值成功！获得 ${amount} 积分。${rewardMessage}`);
    } catch (error) {
        console.error("Recharge transaction error:", error);
        alert("充值失败，请稍后重试");
    }
  };

  const handleEditClick = (item) => {
      setEditingFreight(item);
      setPublishModalOpen(true);
  };

  const handlePublish = async (data, isEdit) => {
    if (!user) {
        setAuthModal({ isOpen: true, type: 'login' });
        return;
    }

    // --- Edit Mode ---
    if (isEdit) {
        try {
            // Update local state first for immediate feedback
            const updatedItem = { ...data };
            setSearchResults(prev => prev.map(item => item.id === data.id ? { ...item, ...updatedItem } : item));
            
            // In a real app, we would update DB here. 
            // Since we are mixing Mock and DB in this demo, let's try to update DB if it has objectId
            if (data.objectId) {
                // It's a DB item
                const { id: _, objectId, creator_id, createdAt, ...fieldsToUpdate } = data;
                await trickleUpdateObject('freight', objectId, fieldsToUpdate);
            } else {
                // It's a mock item, just local update is enough for demo
            }

            alert("修改成功！");
            setPublishModalOpen(false);
            setEditingFreight(null);
        } catch (error) {
            console.error("Update error:", error);
            alert("修改失败");
        }
        return;
    }

    // --- Create Mode ---
    if (user.points < 2) {
        alert("发布现舱需消耗 2 积分，您的余额不足！");
        setRechargeModalOpen(true);
        return;
    }

    // Confirmation Step
    if (!window.confirm("发布该现舱信息将扣除您 2 积分。\n\n是否确认立即发布？")) {
        return;
    }

    try {
        // Deduct points
        const newPoints = user.points - 2;
        const { objectId, ...userData } = user;
        const updatedUserData = { ...userData, points: newPoints };
        
        await trickleUpdateObject('user', objectId, updatedUserData);
        setUser(prev => ({ ...prev, points: newPoints }));

        // Prepare new freight data
        const newFreight = {
            ...data,
            id: `FR-${Date.now()}`,
            provider: user.phone || user.email,
            providerContact: user.phone || user.email, // In real app, maybe separate contact field
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            currency: 'USD',
            creator_id: user.objectId, // Important for ownership check
            status: 'active'
        };

        // Create in DB
        const created = await trickleCreateObject('freight', {
            origin: newFreight.origin,
            destination: newFreight.destination,
            price: parseInt(newFreight.price),
            volume: parseInt(newFreight.volume),
            carrier: newFreight.carrier,
            container_type: newFreight.containerType,
            cutoff_date: newFreight.cutoffDate,
            surcharges: newFreight.surcharges,
            status: 'active',
            creator_id: user.objectId,
            provider_info: JSON.stringify({ name: user.phone || user.email, contact: user.phone })
        });

        // Add to local list with new objectId from DB
        const freightWithId = { ...newFreight, objectId: created.objectId };
        
        setSearchResults(prev => [freightWithId, ...prev]);
        
        // Notify
        alert("现舱信息发布成功！已扣除 2 积分。");
        setPublishModalOpen(false);
    } catch (error) {
        console.error("Publish transaction error:", error);
        alert("发布失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" data-name="app">
      <Header 
        user={user} 
        onLoginClick={() => setAuthModal({ isOpen: true, type: 'login' })}
        onRegisterClick={() => setAuthModal({ isOpen: true, type: 'register' })}
        onLogout={() => setUser(null)}
        onRechargeClick={() => setRechargeModalOpen(true)}
        onPublishClick={() => { setEditingFreight(null); setPublishModalOpen(true); }}
        notifications={notifications}
        onMarkNotifRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
      />

      <main className="flex-grow">
        <Hero onSearch={handleSearch} />

        <AdSection />

        <div className="container mx-auto px-4 relative z-20">
            {hasSearched && (
                <FreightList 
                    title={isInitialLoad ? "最新现舱资源" : "搜索结果"}
                    results={searchResults} 
                    unlockedItems={unlockedItems}
                    onUnlockItem={handleUnlockItem}
                    currentUser={user}
                    onEditItem={handleEditClick}
                />
            )}
            
            {!hasSearched && (
                <div className="mt-20 text-center text-gray-400">
                    <div className="icon-globe text-6xl mx-auto mb-4 opacity-20"></div>
                    <p>请输入起运港和目的港开始查询全球运价</p>
                </div>
            )}
        </div>
      </main>

      <Footer onOpenTerms={() => setTermsModalOpen(true)} />

      <AuthModal 
        isOpen={authModal.isOpen} 
        type={authModal.type} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSwitchType={() => setAuthModal(prev => ({ ...prev, type: prev.type === 'login' ? 'register' : 'login' }))}
        onLoginSuccess={(userData) => {
            setUser(userData);
            // setAuthModal({ ...authModal, isOpen: false }); // Handled in AuthModal
        }}
      />

      <RechargeModal 
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        onRecharge={handleRecharge}
      />

      <PublishModal 
        isOpen={publishModalOpen}
        onClose={() => { setPublishModalOpen(false); setEditingFreight(null); }}
        onPublish={handlePublish}
        initialData={editingFreight}
      />

      <UserCenter 
        isOpen={userCenterOpen}
        onClose={() => setUserCenterOpen(false)}
        user={user}
        onOpenTerms={() => setTermsModalOpen(true)}
      />

      <TermsModal 
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);