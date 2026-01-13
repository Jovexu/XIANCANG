<template>
  <view class="detail-container">
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="shipment" class="detail-content">
      <view class="header-card">
        <view class="route-section">
          <view class="port-info">
            <text class="port-label">起运港</text>
            <text class="port-name">{{ shipment.from_port }}</text>
          </view>
          <view class="route-arrow">
            <text class="arrow-icon">→</text>
          </view>
          <view class="port-info">
            <text class="port-label">目的港</text>
            <text class="port-name">{{ shipment.to_port }}</text>
          </view>
        </view>

        <view class="price-section">
          <text class="price-label">运价</text>
          <view class="price-value">
            <text class="currency">$</text>
            <text class="amount">{{ shipment.price }}</text>
          </view>
        </view>
      </view>

      <view class="info-card">
        <view class="card-title">
          <text class="title-text">舱位信息</text>
        </view>

        <view class="info-grid">
          <view class="info-item">
            <view class="info-icon">📦</view>
            <view class="info-content">
              <text class="info-label">柜型</text>
              <text class="info-value">{{ shipment.container_type }}</text>
            </view>
          </view>

          <view class="info-item">
            <view class="info-icon">🔢</view>
            <view class="info-content">
              <text class="info-label">柜量</text>
              <text class="info-value">{{ shipment.container_quantity }}</text>
            </view>
          </view>

          <view class="info-item full-width">
            <view class="info-icon">🚢</view>
            <view class="info-content">
              <text class="info-label">船公司</text>
              <text class="info-value company">{{ shipment.shipping_company }}</text>
            </view>
          </view>

          <view class="info-item">
            <view class="info-icon">📅</view>
            <view class="info-content">
              <text class="info-label">截关日期</text>
              <text class="info-value">{{ formatDate(shipment.closing_date) }}</text>
            </view>
          </view>

          <view class="info-item">
            <view class="info-icon">🕒</view>
            <view class="info-content">
              <text class="info-label">预计到港</text>
              <text class="info-value">{{ formatDate(shipment.eta) }}</text>
            </view>
          </view>

          <view class="info-item full-width">
            <view class="info-icon">⏰</view>
            <view class="info-content">
              <text class="info-label">运费有效期</text>
              <text class="info-value">{{ formatDate(shipment.valid_until) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="contact-card">
        <view class="card-title">
          <text class="title-text">联系方式</text>
        </view>

        <view v-if="!isUnlocked" class="locked-section">
          <view class="lock-icon">🔒</view>
          <text class="lock-text">联系方式已加密</text>
          <text class="lock-hint">解锁后可查看提交方联系方式</text>
          <view class="unlock-btn" @click="handleUnlock">
            <text class="unlock-text">解锁联系方式</text>
            <text class="unlock-price">（3积分）</text>
          </view>
        </view>

        <view v-else class="unlocked-section">
          <view class="unlock-icon">✅</view>
          <text class="unlocked-text">已解锁</text>
          <view class="contact-info">
            <text class="contact-label">联系方式：</text>
            <text class="contact-value">{{ shipment.submitter_contact }}</text>
          </view>
          <view class="copy-btn" @click="copyContact">
            <text class="copy-text">复制联系方式</text>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-text">舱位信息不存在</text>
      <view class="back-btn" @click="goBack">
        <text class="back-text">返回首页</text>
      </view>
    </view>

    <view v-if="showPayModal" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认支付</text>
          <view class="modal-close" @click="closeModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <text class="modal-text">解锁联系方式需支付</text>
          <text class="modal-price">3积分</text>
          <text class="modal-hint">支付后可查看提交方联系信息</text>
        </view>
        <view class="modal-footer">
          <view class="cancel-btn" @click="closeModal">
            <text class="cancel-text">取消</text>
          </view>
          <view class="confirm-btn" @click="confirmPay">
            <text class="confirm-text">确认支付</text>
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
      shipmentId: '',
      shipment: null,
      loading: true,
      isUnlocked: false,
      showPayModal: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.shipmentId = options.id;
      this.loadShipmentDetail();
    } else {
      this.loading = false;
      uni.showToast({
        title: '缺少舱位ID',
        icon: 'none'
      });
    }
  },
  methods: {
    loadShipmentDetail() {
      this.loading = true;
      const token = uni.getStorageSync('token');

      uni.request({
        url: `/api/shipment/${this.shipmentId}`,
        method: 'GET',
        header: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        success: (res) => {
          this.loading = false;
          if (res.data.success) {
            this.shipment = res.data.data;
            this.isUnlocked = res.data.data.isUnlocked || false;
          } else {
            uni.showToast({
              title: res.data.message || '加载失败',
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
    handleUnlock() {
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

      this.showPayModal = true;
    },
    confirmPay() {
      const token = uni.getStorageSync('token');
      
      uni.showLoading({
        title: '支付中...'
      });

      uni.request({
        url: '/api/unlock-contact',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          shipment_id: this.shipmentId
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            this.isUnlocked = true;
            this.shipment.submitter_contact = res.data.contact;
            this.showPayModal = false;

            const userInfo = uni.getStorageSync('userInfo');
            if (userInfo && res.data.newBalance !== undefined) {
              userInfo.balance = res.data.newBalance;
              uni.setStorageSync('userInfo', userInfo);
            }

            uni.showToast({
              title: '解锁成功',
              icon: 'success'
            });
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
      this.showPayModal = false;
    },
    copyContact() {
      if (this.shipment && this.shipment.submitter_contact) {
        uni.setClipboardData({
          data: this.shipment.submitter_contact,
          success: () => {
            uni.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            });
          }
        });
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      return dateStr.split(' ')[0];
    },
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    }
  }
};
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
  padding-bottom: 40rpx;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 32rpx;
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

.error-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.error-text {
  font-size: 32rpx;
  color: #fff;
  margin-bottom: 48rpx;
}

.back-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
}

.back-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
}

.detail-content {
  padding: 40rpx;
}

.header-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.route-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.port-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.port-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.port-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #1a5490;
}

.route-arrow {
  padding: 0 32rpx;
}

.arrow-icon {
  font-size: 48rpx;
  color: #d4af37;
}

.price-section {
  padding-top: 32rpx;
  border-top: 2rpx solid #f0f0f0;
  text-align: center;
}

.price-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.price-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 32rpx;
  color: #d4af37;
  margin-right: 8rpx;
}

.amount {
  font-size: 56rpx;
  font-weight: bold;
  color: #d4af37;
}

.info-card,
.contact-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.card-title {
  margin-bottom: 32rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5490;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.locked-section,
.unlocked-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 20rpx;
}

.lock-icon,
.unlock-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.lock-text,
.unlocked-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.lock-hint {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.unlock-btn {
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
  display: flex;
  align-items: center;
}

.unlock-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
}

.unlock-price {
  font-size: 24rpx;
  color: #1a5490;
  margin-left: 8rpx;
}

.contact-info {
  width: 100%;
  padding: 32rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  text-align: center;
}

.contact-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.contact-value {
  display: block;
  font-size: 36rpx;
  color: #d4af37;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.copy-btn {
  padding: 20rpx 40rpx;
  background: #1a5490;
  border-radius: 40rpx;
}

.copy-text {
  font-size: 26rpx;
  color: #fff;
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
  border-radius: 20rpx;
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

.modal-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.modal-price {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 16rpx;
}

.modal-hint {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  display: flex;
  gap: 20rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background: #f0f0f0;
}

.confirm-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  box-shadow: 0 4rpx 16rpx rgba(212, 175, 55, 0.4);
}

.cancel-text {
  font-size: 28rpx;
  color: #666;
}

.confirm-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
}
</style>