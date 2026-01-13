<template>
  <view class="index-container">
    <view class="top-bar">
      <view class="header-left">
        <image 
          class="logo" 
          src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_21/1757617076261-4900.jpg"
          mode="aspectFit"
        />
        <view class="title-group">
          <text class="title">国际海运实时现舱</text>
          <text class="subtitle">让您高效匹配最优运费</text>
        </view>
      </view>
      
      <view class="header-right">
        <view v-if="isLoggedIn" class="user-info-compact">
          <view class="balance-compact" @click="goToPay">
            <text class="balance-icon">💰</text>
            <text class="balance-value-compact">{{ userBalance }}积分</text>
          </view>
          <text class="logout-btn-compact" @click="handleLogout">退出</text>
        </view>
        <view v-else class="auth-buttons-compact">
          <text class="auth-btn-compact" @click="goToLogin">登录</text>
          <text class="auth-btn-compact" @click="goToRegister">注册</text>
        </view>
      </view>
    </view>

    <!-- 新增船运展示图片区域 -->
    <view class="promo-section">
      <image 
        class="promo-image" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_8/1757244970137-4859.jpg" 
        mode="aspectFill"
      />
      <image 
        class="promo-image" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_8/1757228551672-4395.jpg" 
        mode="aspectFill"
      />
    </view>

    <view class="search-section">
      <text class="search-title">查询舱位</text>
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="fromPort" 
          placeholder="起运港"
          placeholder-class="placeholder"
        />
        <text class="search-divider">→</text>
        <input 
          class="search-input" 
          v-model="toPort" 
          placeholder="目的港"
          placeholder-class="placeholder"
        />
      </view>
      <view class="search-btn" @click="handleSearch">
        <text class="search-text">搜索舱位</text>
      </view>
    </view>

    <view class="recent-section">
      <text class="section-title">最新舱位</text>
      
      <view v-if="loading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <scroll-view v-else-if="recentShipments.length > 0" scroll-y class="recent-scroll">
        <view 
          v-for="item in recentShipments" 
          :key="item.id" 
          class="shipment-card"
          @click="viewDetail(item.id)"
        >
          <view class="card-header">
            <view class="route">
              <text class="port-name">{{ item.from_port }}</text>
              <text class="route-arrow">→</text>
              <text class="port-name">{{ item.to_port }}</text>
            </view>
            <view class="price">
              <text class="price-currency">$</text>
              <text class="price-value">{{ item.price }}</text>
            </view>
          </view>
          
          <view class="card-divider"></view>
          
          <!-- 紧凑单行显示 -->
          <scroll-view scroll-x class="card-body-compact">
            <view class="compact-row">
              <view class="compact-item">
                <text class="compact-label">柜型:</text>
                <text class="compact-value">{{ item.container_type }}</text>
              </view>
              <view class="separator">|</view>
              
              <view class="compact-item">
                <text class="compact-label">柜量:</text>
                <text class="compact-value">{{ item.container_quantity }}</text>
              </view>
              <view class="separator">|</view>
              
              <view class="compact-item">
                <text class="compact-label">船公司:</text>
                <text class="compact-value company">{{ item.shipping_company }}</text>
              </view>
              <view class="separator">|</view>
              
              <view class="compact-item">
                <text class="compact-label">截关:</text>
                <text class="compact-value">{{ formatDate(item.closing_date) }}</text>
              </view>
              <view class="separator">|</view>
              
              <view class="compact-item">
                <text class="compact-label">到港:</text>
                <text class="compact-value">{{ formatDate(item.eta) }}</text>
              </view>
              <view class="separator">|</view>

              <view class="compact-item">
                <text class="compact-label">联系方式:</text>
                <text class="compact-value highlight">点击解锁（支付3积分）</text>
              </view>
            </view>
          </scroll-view>
          
        </view>
      </scroll-view>

      <view v-else class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无舱位信息</text>
        <text class="empty-hint">敬请期待更多舱位数据</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      userBalance: 0,
      userEmail: '',
      fromPort: '',
      toPort: '',
      recentShipments: [],
      loading: true
    };
  },
  onShow() {
    this.checkLoginStatus();
    this.loadRecentShipments();
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      
      if (token && userInfo) {
        this.isLoggedIn = true;
        this.userBalance = userInfo.balance || 0;
        this.userEmail = userInfo.email || '';
        this.loadUserInfo();
      } else {
        this.isLoggedIn = false;
      }
    },
    loadUserInfo() {
      const token = uni.getStorageSync('token');
      if (!token) return;

      uni.request({
        url: '/api/user/info',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data.success) {
            this.userBalance = res.data.user.balance;
            this.userEmail = res.data.user.email;
            uni.setStorageSync('userInfo', res.data.user);
          }
        }
      });
    },
    loadRecentShipments() {
      this.loading = true;
      uni.request({
        url: '/api/search',
        method: 'GET',
        data: {
          page: 1
        },
        success: (res) => {
          this.loading = false;
          if (res.data.success) {
            this.recentShipments = (res.data.data || []).slice(0, 20);
          }
        },
        fail: () => {
          this.loading = false;
          uni.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          });
        }
      });
    },
    handleSearch() {
      if (!this.fromPort && !this.toPort) {
        uni.showToast({
          title: '请输入起运港或目的港',
          icon: 'none'
        });
        return;
      }

      uni.navigateTo({
        url: `/pages/search/search?from_port=${this.fromPort}&to_port=${this.toPort}`
      });
    },
    viewDetail(id) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    },
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      });
    },
    goToPay() {
      if (!this.isLoggedIn) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          this.goToLogin();
        }, 1500);
        return;
      }
      uni.navigateTo({
        url: '/pages/pay/pay'
      });
    },
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            this.isLoggedIn = false;
            this.userBalance = 0;
            this.userEmail = '';
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          }
        }
      });
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      return dateStr.split(' ')[0];
    }
  }
};
</script>

<style scoped>
uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}

.index-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
  padding-bottom: 40rpx;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(180deg, rgba(26, 84, 144, 0.95) 0%, transparent 100%);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(212, 175, 55, 0.3);
}

.title-group {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 4rpx;
  letter-spacing: 1rpx;
}

.subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 300;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info-compact {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.balance-compact {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 14rpx;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 20rpx;
  border: 1rpx solid rgba(212, 175, 55, 0.5);
}

.balance-icon {
  font-size: 20rpx;
}

.balance-value-compact {
  font-size: 20rpx;
  color: #d4af37;
  font-weight: bold;
}

.logout-btn-compact {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  padding: 6rpx 14rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
}

.auth-buttons-compact {
  display: flex;
  gap: 12rpx;
}

.auth-btn-compact {
  font-size: 20rpx;
  color: #1a5490;
  font-weight: bold;
  padding: 8rpx 18rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 新增展示图片区域样式 */
.promo-section {
  display: flex;
  justify-content: space-between;
  margin: 0 40rpx 32rpx;
  gap: 24rpx;
}

.promo-image {
  flex: 1;
  height: 200rpx;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
  /* 确保两个图片平分宽度 */
  width: calc(50% - 12rpx);
}

.search-section {
  margin: 0 40rpx 40rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.search-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5490;
  margin-bottom: 32rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 32rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  color: #333;
}

.search-divider {
  font-size: 32rpx;
  color: #d4af37;
  margin: 0 16rpx;
  font-weight: bold;
}

.placeholder {
  color: #999;
}

.search-btn {
  height: 88rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(212, 175, 55, 0.4);
}

.search-text {
  font-size: 32rpx;
  color: #1a5490;
  font-weight: bold;
}

.recent-section {
  margin: 0 40rpx;
}

.section-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 24rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.recent-scroll {
  height: 1000rpx;
}

.shipment-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.shipment-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.route {
  display: flex;
  align-items: center;
}

.port-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #1a5490;
}

.route-arrow {
  font-size: 28rpx;
  color: #d4af37;
  margin: 0 12rpx;
}

.price {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 22rpx;
  color: #d4af37;
  margin-right: 4rpx;
}

.price-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #d4af37;
}

.card-divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
  margin-bottom: 16rpx;
}

/* 紧凑行样式 */
.card-body-compact {
  width: 100%;
}

.compact-row {
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 4rpx 0;
}

.compact-item {
  display: flex;
  align-items: center;
}

.compact-label {
  font-size: 20rpx;
  color: #999;
  margin-right: 6rpx;
}

.compact-value {
  font-size: 20rpx;
  color: #333;
  font-weight: 500;
}

.compact-value.company {
  color: #1a5490;
  font-weight: bold;
}

.compact-value.highlight {
  color: #d4af37;
  font-weight: bold;
}

.separator {
  margin: 0 12rpx;
  font-size: 20rpx;
  color: #e0e0e0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
  font-weight: 500;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}
</style>