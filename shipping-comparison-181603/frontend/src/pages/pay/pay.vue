<template>
  <view class="pay-container">
    <view class="header">
      <image 
        class="logo" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_21/1757617076261-4900.jpg"
        mode="aspectFit"
      />
      <text class="header-title">积分充值</text>
      <text class="header-subtitle">最低充值150元，1元=1积分</text>
    </view>

    <view class="balance-card">
      <view class="balance-info">
        <text class="balance-label">当前积分余额</text>
        <text class="balance-value">{{ userBalance }}</text>
      </view>
    </view>

    <view class="amount-section">
      <text class="section-title">选择充值金额</text>
      <view class="amount-grid">
        <view 
          v-for="item in amountOptions" 
          :key="item"
          class="amount-item"
          :class="{ 'active': selectedAmount === item }"
          @click="selectAmount(item)"
        >
          <text class="amount-text">{{ item }}元</text>
          <text class="amount-credits">{{ item }}积分</text>
        </view>
      </view>

      <view class="custom-amount">
        <text class="custom-label">自定义金额</text>
        <input 
          class="custom-input" 
          v-model="customAmount" 
          type="digit"
          placeholder="最低150元"
          placeholder-class="placeholder"
          @input="onCustomInput"
        />
      </view>
    </view>

    <view class="payment-section">
      <text class="section-title">选择支付方式</text>
      <view class="payment-methods">
        <view 
          class="payment-item"
          :class="{ 'active': paymentMethod === 'wechat' }"
          @click="selectPaymentMethod('wechat')"
        >
          <view class="payment-icon">💚</view>
          <text class="payment-name">微信支付</text>
        </view>
        <view 
          class="payment-item"
          :class="{ 'active': paymentMethod === 'alipay' }"
          @click="selectPaymentMethod('alipay')"
        >
          <view class="payment-icon">💙</view>
          <text class="payment-name">支付宝</text>
        </view>
      </view>
    </view>

    <view class="pay-btn" @click="handlePay">
      <text class="pay-text">立即支付 {{ finalAmount }}元</text>
    </view>

    <view class="tips">
      <text class="tips-text">• 充值的积分用于解锁舱位联系方式</text>
      <text class="tips-text">• 每次解锁需支付3积分</text>
      <text class="tips-text">• 积分不可提现，请合理充值</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userBalance: 0,
      amountOptions: [150, 300, 500, 1000, 2000, 5000],
      selectedAmount: 150,
      customAmount: '',
      paymentMethod: 'wechat',
      finalAmount: 150
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
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

      uni.request({
        url: '/api/user/info',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data.success) {
            this.userBalance = res.data.user.balance;
          }
        }
      });
    },
    selectAmount(amount) {
      this.selectedAmount = amount;
      this.customAmount = '';
      this.finalAmount = amount;
    },
    onCustomInput(e) {
      const value = parseInt(e.detail.value) || 0;
      this.selectedAmount = null;
      this.finalAmount = value;
    },
    selectPaymentMethod(method) {
      this.paymentMethod = method;
    },
    handlePay() {
      if (this.finalAmount < 150) {
        uni.showToast({
          title: '最低充值150元',
          icon: 'none'
        });
        return;
      }

      if (!this.paymentMethod) {
        uni.showToast({
          title: '请选择支付方式',
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
        return;
      }

      uni.showLoading({
        title: '支付中...'
      });

      uni.request({
        url: '/api/recharge',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          amount: this.finalAmount
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            this.userBalance = res.data.balance;
            uni.showToast({
              title: '充值成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '充值失败',
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
    }
  }
};
</script>

<style scoped>
.pay-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
  padding-bottom: 40rpx;
}

.header {
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 16rpx;
}

.header-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.balance-card {
  margin: 40rpx;
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.balance-info {
  text-align: center;
}

.balance-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.balance-value {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: #d4af37;
}

.amount-section,
.payment-section {
  margin: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
  margin-bottom: 24rpx;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.amount-item {
  padding: 30rpx 20rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
  text-align: center;
  border: 3rpx solid transparent;
  transition: all 0.3s;
}

.amount-item.active {
  background: #d4af37;
  border-color: #f4d03f;
}

.amount-text {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #1a5490;
  margin-bottom: 8rpx;
}

.amount-item.active .amount-text,
.amount-item.active .amount-credits {
  color: #fff;
}

.amount-credits {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.custom-amount {
  margin-top: 30rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
}

.custom-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
}

.custom-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
}

.placeholder {
  color: #999;
}

.payment-methods {
  display: flex;
  gap: 20rpx;
}

.payment-item {
  flex: 1;
  padding: 40rpx 20rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12rpx;
  text-align: center;
  border: 3rpx solid transparent;
  transition: all 0.3s;
}

.payment-item.active {
  background: #d4af37;
  border-color: #f4d03f;
}

.payment-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.payment-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.payment-item.active .payment-name {
  color: #fff;
}

.pay-btn {
  margin: 60rpx 40rpx 40rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
}

.pay-text {
  font-size: 32rpx;
  color: #1a5490;
  font-weight: bold;
}

.tips {
  padding: 0 40rpx;
}

.tips-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 2;
}
</style>