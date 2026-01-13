<template>
  <view class="login-container">
    <view class="header">
      <image 
        class="logo" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_21/1757617076261-4900.jpg"
        mode="aspectFit"
      />
      <text class="header-title">国际海运实时现舱</text>
      <text class="header-subtitle">让您高效匹配最优运费</text>
    </view>

    <view class="form-container">
      <view class="form-card">
        <view class="form-item">
          <text class="label">手机号/邮箱</text>
          <input 
            class="input" 
            v-model="formData.account" 
            placeholder="请输入手机号或邮箱"
            placeholder-class="placeholder"
          />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <input 
            class="input" 
            v-model="formData.password" 
            type="password"
            password
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
        </view>

        <view class="login-btn" @click="handleLogin">
          <text class="login-text">登录</text>
        </view>

        <view class="register-link">
          <text class="link-text">还没有账号？</text>
          <text class="link-btn" @click="goToRegister">立即注册</text>
        </view>
      </view>
    </view>

    <!-- 积分余额和充值区域 -->
    <view class="balance-section">
      <view class="balance-card">
        <view class="balance-info">
          <text class="balance-icon">💰</text>
          <view class="balance-content">
            <text class="balance-label">当前积分余额</text>
            <text class="balance-value">{{ userBalance }} 积分</text>
          </view>
        </view>
        <view class="recharge-btn" @click="showRechargePrompt">
          <text class="recharge-text">充值</text>
        </view>
      </view>
    </view>

    <view class="decoration">
      <image 
        class="bg-image" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_2/1757173681147-1967.jpg"
        mode="aspectFill"
      />
    </view>

    <!-- 充值提示弹窗 -->
    <view v-if="showPaymentModal" class="modal-overlay" @click="closePaymentModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">充值提示</text>
          <view class="modal-close" @click="closePaymentModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <text class="modal-desc">请先绑定支付方式后再充值</text>
          <view class="payment-options">
            <view class="payment-option" @click="bindPayment('wechat')">
              <text class="payment-icon">💚</text>
              <text class="payment-name">绑定微信支付</text>
            </view>
            <view class="payment-option" @click="bindPayment('alipay')">
              <text class="payment-icon">💙</text>
              <text class="payment-name">绑定支付宝</text>
            </view>
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
      formData: {
        account: '',
        password: ''
      },
      userBalance: 0,
      showPaymentModal: false
    };
  },
  onLoad() {
    this.fetchBalance();
  },
  methods: {
    handleLogin() {
      const { account, password } = this.formData;

      if (!account) {
        uni.showToast({
          title: '请输入手机号或邮箱',
          icon: 'none'
        });
        return;
      }

      if (!password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '登录中...'
      });

      uni.request({
        url: '/api/login',
        method: 'POST',
        data: {
          account: account,
          password: password
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            uni.setStorageSync('token', res.data.token);
            uni.setStorageSync('userInfo', res.data.user);
            
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '登录失败',
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
    goToRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      });
    },
    fetchBalance() {
      const token = uni.getStorageSync('token');
      if (!token) {
        this.userBalance = 0;
        return;
      }

      uni.request({
        url: '/api/getBalance',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data.success) {
            this.userBalance = res.data.balance;
          }
        },
        fail: () => {
          console.error('获取积分余额失败');
        }
      });
    },
    showRechargePrompt() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      this.showPaymentModal = true;
    },
    closePaymentModal() {
      this.showPaymentModal = false;
    },
    bindPayment(paymentType) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '绑定中...'
      });

      uni.request({
        url: '/api/requestPaymentBinding',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          paymentType: paymentType
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            uni.showToast({
              title: res.data.message || '绑定成功',
              icon: 'success'
            });
            this.closePaymentModal();
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/pay/pay'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '绑定失败',
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
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
  position: relative;
  overflow: hidden;
}

.header {
  padding: 100rpx 40rpx 80rpx;
  text-align: center;
  position: relative;
  z-index: 2;
}

.logo {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 32rpx rgba(212, 175, 55, 0.3);
}

.header-title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 24rpx;
  letter-spacing: 2rpx;
}

.header-subtitle {
  display: block;
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.form-container {
  padding: 0 40rpx;
  position: relative;
  z-index: 2;
}

.form-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24rpx;
  padding: 60rpx 48rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

.form-item {
  margin-bottom: 48rpx;
}

.label {
  display: block;
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 96rpx;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 30rpx;
  color: #333;
  box-sizing: border-box;
  border: 3rpx solid transparent;
  transition: all 0.3s;
}

.input:focus {
  background: #fff;
  border-color: #d4af37;
  box-shadow: 0 0 0 6rpx rgba(212, 175, 55, 0.1);
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.login-btn {
  margin-top: 80rpx;
  height: 104rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(212, 175, 55, 0.5);
  transition: all 0.3s;
}

.login-btn:active {
  transform: scale(0.98);
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
}

.login-text {
  font-size: 34rpx;
  color: #1a5490;
  font-weight: bold;
  letter-spacing: 4rpx;
}

.register-link {
  margin-top: 48rpx;
  text-align: center;
}

.link-text {
  font-size: 28rpx;
  color: #666;
}

.link-btn {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
  margin-left: 12rpx;
}

.decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  overflow: hidden;
  z-index: 1;
}

.bg-image {
  width: 100%;
  height: 100%;
  opacity: 0.15;
  filter: blur(4rpx);
}

.balance-section {
  margin: 40rpx;
  position: relative;
  z-index: 2;
}

.balance-card {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid rgba(212, 175, 55, 0.3);
}

.balance-info {
  display: flex;
  align-items: center;
}

.balance-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.balance-content {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.balance-value {
  font-size: 32rpx;
  color: #d4af37;
  font-weight: bold;
}

.recharge-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(212, 175, 55, 0.4);
  transition: all 0.3s;
}

.recharge-btn:active {
  transform: scale(0.95);
}

.recharge-text {
  font-size: 28rpx;
  color: #1a5490;
  font-weight: bold;
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
}

.modal-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 32rpx;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  transition: all 0.3s;
}

.payment-option:active {
  background: #e8e8e8;
  transform: scale(0.98);
}

.payment-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}

.payment-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>