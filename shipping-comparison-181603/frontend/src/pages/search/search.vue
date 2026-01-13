<template>
  <view class="search-container">
    <view class="search-header">
      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="fromPort" 
          placeholder="起运港"
          placeholder-class="placeholder"
          @confirm="handleSearch"
        />
        <text class="search-arrow">→</text>
        <input 
          class="search-input" 
          v-model="toPort" 
          placeholder="目的港"
          placeholder-class="placeholder"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">
          <text class="search-icon">🔍</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="result-scroll" @scrolltolower="loadMore">
      <view v-if="loading && shipmentList.length === 0" class="loading-container">
        <text class="loading-spinner"></text>
        <text class="loading-text">搜索中...</text>
      </view>

      <view v-else-if="shipmentList.length === 0 && !showExampleData" class="empty-container">
        <text class="empty-icon">⛴️</text>
        <text class="empty-text">暂无舱位信息</text>
        <text class="empty-hint">请尝试调整搜索条件</text>
        <view class="example-btn" @click="loadExampleData">
          <text class="example-btn-text">查看范例数据</text>
        </view>
      </view>

      <view v-else class="shipment-list">
        <view v-if="showExampleData" class="example-banner">
          <text class="banner-icon">💡</text>
          <text class="banner-text">以下为系统范例数据，仅供参考</text>
          <view class="banner-close" @click="closeExampleData">
            <text class="close-text">×</text>
          </view>
        </view>

        <view 
          v-for="item in shipmentList" 
          :key="item.id" 
          class="shipment-card"
          :class="{ 'example-card': item.isExample }"
        >
          <view v-if="item.isExample" class="example-tag">
            <text class="tag-text">范例</text>
          </view>

          <view class="card-header">
            <view class="route-info">
              <text class="port-name">{{ item.from_port }}</text>
              <text class="route-arrow">→</text>
              <text class="port-name">{{ item.to_port }}</text>
            </view>
            <view class="price-tag">
              <text class="price-currency">$</text>
              <text class="price-value">{{ item.price }}</text>
            </view>
          </view>

          <view class="card-divider"></view>

          <view class="card-body">
            <view class="info-row">
              <view class="info-item">
                <text class="info-label">柜型</text>
                <text class="info-value">{{ item.container_type }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">柜量</text>
                <text class="info-value">{{ item.container_quantity }}</text>
              </view>
            </view>

            <view class="info-row">
              <view class="info-item full-width">
                <text class="info-label">船公司</text>
                <text class="info-value company">{{ item.shipping_company }}</text>
              </view>
            </view>

            <view class="info-row">
              <view class="info-item">
                <text class="info-label">截关日期</text>
                <text class="info-value">{{ formatDate(item.closing_date) }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">预计到港</text>
                <text class="info-value">{{ formatDate(item.eta) }}</text>
              </view>
            </view>

            <view class="info-row">
              <view class="info-item full-width">
                <text class="info-label">运费有效期</text>
                <text class="info-value">{{ formatDate(item.valid_until) }}</text>
              </view>
            </view>
          </view>

          <view class="card-footer">
            <view 
              class="book-btn" 
              :class="{ 'disabled': item.isExample }"
              @click="handleBook(item)"
            >
              <text class="book-text">{{ item.isExample ? '范例数据（不可订舱）' : '订舱确认（3积分）' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="hasMore && !loading && !showExampleData" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>

      <view v-if="!hasMore && shipmentList.length > 0 && !showExampleData" class="no-more">
        <text class="no-more-text">已显示全部结果</text>
      </view>
    </scroll-view>

    <view v-if="showContactModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">联系方式</text>
          <view class="modal-close" @click="closeModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <text class="contact-info">{{ contactInfo }}</text>
        </view>
        <view class="modal-footer">
          <view class="modal-btn" @click="closeModal">
            <text class="modal-btn-text">关闭</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      fromPort: '',
      toPort: '',
      shipmentList: [],
      currentPage: 1,
      totalPages: 1,
      loading: false,
      hasMore: true,
      showContactModal: false,
      contactInfo: '',
      showExampleData: false,
      exampleData: [
        {
          id: 'example-001',
          from_port: '上海',
          to_port: '洛杉矶',
          price: 1200,
          container_type: '40HQ',
          container_quantity: 5,
          shipping_company: '中远海运',
          closing_date: '2025-12-20',
          eta: '2026-01-10',
          valid_until: '2025-12-25',
          isExample: true
        },
        {
          id: 'example-002',
          from_port: '深圳',
          to_port: '纽约',
          price: 1580,
          container_type: '40GP',
          container_quantity: 3,
          shipping_company: '马士基',
          closing_date: '2025-12-22',
          eta: '2026-01-15',
          valid_until: '2025-12-28',
          isExample: true
        },
        {
          id: 'example-003',
          from_port: '宁波',
          to_port: '鹿特丹',
          price: 2100,
          container_type: '20GP',
          container_quantity: 10,
          shipping_company: '达飞轮船',
          closing_date: '2025-12-18',
          eta: '2026-01-20',
          valid_until: '2025-12-23',
          isExample: true
        },
        {
          id: 'example-004',
          from_port: '青岛',
          to_port: '汉堡',
          price: 1950,
          container_type: '40HQ',
          container_quantity: 8,
          shipping_company: '赫伯罗特',
          closing_date: '2025-12-25',
          eta: '2026-01-25',
          valid_until: '2025-12-30',
          isExample: true
        },
        {
          id: 'example-005',
          from_port: '天津',
          to_port: '悉尼',
          price: 1380,
          container_type: '20RF',
          container_quantity: 2,
          shipping_company: '东方海外',
          closing_date: '2025-12-19',
          eta: '2026-01-08',
          valid_until: '2025-12-24',
          isExample: true
        }
      ]
    };
  },
  onLoad(options) {
    if (options.from_port) {
      this.fromPort = options.from_port;
    }
    if (options.to_port) {
      this.toPort = options.to_port;
    }
    if (this.fromPort || this.toPort) {
      this.handleSearch();
    }
  },
  methods: {
    handleSearch() {
      this.currentPage = 1;
      this.shipmentList = [];
      this.hasMore = true;
      this.showExampleData = false;
      this.loadData();
    },
    loadData() {
      if (this.loading) return;
      
      this.loading = true;
      
      uni.request({
        url: '/api/search',
        method: 'GET',
        data: {
          from_port: this.fromPort,
          to_port: this.toPort,
          page: this.currentPage
        },
        success: (res) => {
          this.loading = false;
          if (res.data.success) {
            const newData = res.data.data || [];
            this.shipmentList = [...this.shipmentList, ...newData];
            this.totalPages = res.data.totalPages || 1;
            this.hasMore = this.currentPage < this.totalPages;
          } else {
            uni.showToast({
              title: res.data.message || '搜索失败',
              icon: 'none'
            });
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
    loadMore() {
      if (!this.hasMore || this.loading || this.showExampleData) return;
      this.currentPage++;
      this.loadData();
    },
    loadExampleData() {
      this.shipmentList = [...this.exampleData];
      this.showExampleData = true;
      this.hasMore = false;
      uni.showToast({
        title: '已加载范例数据',
        icon: 'success',
        duration: 1500
      });
    },
    closeExampleData() {
      this.shipmentList = [];
      this.showExampleData = false;
      this.fromPort = '';
      this.toPort = '';
    },
    handleBook(item) {
      if (item.isExample) {
        uni.showToast({
          title: '范例数据不支持订舱',
          icon: 'none'
        });
        return;
      }

      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
        return;
      }

      uni.showModal({
        title: '确认订舱',
        content: '解锁联系方式需支付3积分，是否继续？',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.unlockContact(item.id);
          }
        }
      });
    },
    unlockContact(shipmentId) {
      const token = uni.getStorageSync('token');
      
      uni.showLoading({
        title: '解锁中...'
      });

      uni.request({
        url: '/api/pay',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          shipment_id: shipmentId
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            this.contactInfo = res.data.contact;
            this.showContactModal = true;
            
            const userInfo = uni.getStorageSync('userInfo');
            if (userInfo && res.data.newBalance !== undefined) {
              userInfo.balance = res.data.newBalance;
              uni.setStorageSync('userInfo', userInfo);
            }
          } else {
            uni.showToast({
              title: res.data.message || '解锁失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none'
          });
        }
      });
    },
    closeModal() {
      this.showContactModal = false;
      this.contactInfo = '';
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

.search-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
}

.search-header {
  padding: 40rpx;
  background: rgba(26, 84, 144, 0.95);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 48rpx;
  padding: 12rpx 24rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  font-size: 28rpx;
  color: #333;
  padding: 0 16rpx;
}

.search-arrow {
  font-size: 32rpx;
  color: #d4af37;
  margin: 0 12rpx;
}

.search-btn {
  width: 64rpx;
  height: 64rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  font-size: 32rpx;
}

.placeholder {
  color: #999;
}

.result-scroll {
  height: calc(100vh - 184rpx);
  padding: 20rpx;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #fff;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 40rpx;
}

.example-btn {
  margin-top: 20rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
}

.example-btn-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
}

.shipment-list {
  padding-bottom: 40rpx;
}

.example-banner {
  display: flex;
  align-items: center;
  background: rgba(212, 175, 55, 0.15);
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
  border-radius: 12rpx;
  border: 2rpx solid rgba(212, 175, 55, 0.3);
}

.banner-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.banner-text {
  flex: 1;
  font-size: 24rpx;
  color: #fff;
}

.banner-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-text {
  font-size: 48rpx;
  color: #fff;
  line-height: 1;
}

.shipment-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  position: relative;
}

.example-card {
  border: 3rpx dashed rgba(212, 175, 55, 0.5);
}

.example-tag {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(212, 175, 55, 0.9);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  z-index: 10;
}

.tag-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: bold;
}

.card-header {
  padding: 32rpx;
  background: linear-gradient(135deg, #1a5490 0%, #2a6ab0 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-info {
  display: flex;
  align-items: center;
}

.port-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.route-arrow {
  font-size: 28rpx;
  color: #d4af37;
  margin: 0 16rpx;
}

.price-tag {
  display: flex;
  align-items: baseline;
}

.price-currency {
  font-size: 24rpx;
  color: #d4af37;
  margin-right: 4rpx;
}

.price-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #d4af37;
}

.card-divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
  margin: 0 32rpx;
}

.card-body {
  padding: 32rpx;
}

.info-row {
  display: flex;
  margin-bottom: 24rpx;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-item.full-width {
  flex: none;
  width: 100%;
}

.info-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.info-value.company {
  color: #1a5490;
  font-weight: bold;
}

.card-footer {
  padding: 24rpx 32rpx 32rpx;
}

.book-btn {
  height: 80rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(212, 175, 55, 0.4);
}

.book-btn.disabled {
  background: linear-gradient(135deg, #999 0%, #bbb 100%);
  box-shadow: none;
  opacity: 0.6;
}

.book-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
}

.book-btn.disabled .book-text {
  color: #666;
}

.load-more,
.no-more {
  padding: 40rpx;
  text-align: center;
}

.load-more-text,
.no-more-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  padding: 32rpx;
  background: linear-gradient(135deg, #1a5490 0%, #2a6ab0 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.modal-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 48rpx;
  color: #fff;
  line-height: 1;
}

.modal-body {
  padding: 48rpx 32rpx;
  text-align: center;
}

.contact-info {
  font-size: 36rpx;
  color: #d4af37;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
}

.modal-btn {
  height: 80rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
}
</style>