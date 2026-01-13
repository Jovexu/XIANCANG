<template>
  <view class="register-container">
    <view class="header">
      <image 
        class="logo" 
        src="https://hpi-hub.tos-cn-beijing.volces.com/static/batch_21/1757617076261-4900.jpg"
        mode="aspectFit"
      />
      <text class="header-title">国际海运实时现舱</text>
      <text class="header-subtitle">让您高效匹配最优运费</text>
    </view>

    <scroll-view scroll-y class="form-scroll">
      <view class="form-container">
        <view v-if="!showVerification" class="form-content">
          <view class="form-item">
            <text class="label">手机号</text>
            <input 
              class="input" 
              v-model="formData.phone" 
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-class="placeholder"
            />
          </view>

          <view class="form-item">
            <text class="label">邮箱地址</text>
            <input 
              class="input" 
              v-model="formData.email" 
              type="text"
              placeholder="请输入邮箱地址"
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
              placeholder="请输入密码（6-20位）"
              placeholder-class="placeholder"
            />
          </view>

          <view class="form-item">
            <text class="label">确认密码</text>
            <input 
              class="input" 
              v-model="formData.confirmPassword" 
              type="password"
              password
              placeholder="请再次输入密码"
              placeholder-class="placeholder"
            />
          </view>

          <view class="register-btn" @click="handleRegister">
            <text class="register-text">注册</text>
          </view>

          <view class="login-link">
            <text class="link-text">已有账号？</text>
            <text class="link-btn" @click="goToLogin">立即登录</text>
          </view>
        </view>

        <view v-else class="verification-content">
          <view class="verification-header">
            <text class="verification-title">邮箱验证</text>
            <text class="verification-desc">验证码已发送至 {{ formData.email }}</text>
          </view>

          <view class="verification-form">
            <view class="form-item">
              <text class="label">验证码</text>
              <input 
                class="input verification-input" 
                v-model="verificationCode" 
                type="number"
                maxlength="6"
                placeholder="请输入6位验证码"
                placeholder-class="placeholder"
              />
            </view>

            <view class="verify-btn" @click="handleVerify">
              <text class="verify-text">验证并完成注册</text>
            </view>

            <view class="resend-link">
              <text class="resend-text" @click="resendCode">重新发送验证码</text>
            </view>
          </view>
        </view>

        <!-- 积分余额和充值区域 -->
        <view class="balance-section">
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
    </scroll-view>

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
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      showVerification: false,
      verificationCode: '',
      userId: '',
      userBalance: 0,
      showPaymentModal: false
    };
  },
  onLoad() {
    this.fetchBalance();
  },
  methods: {
    validatePhone(phone) {
      const phoneReg = /^1[3-9]\d{9}$/;
      return phoneReg.test(phone);
    },
    validateEmail(email) {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailReg.test(email);
    },
    handleRegister() {
      const { phone, email, password, confirmPassword } = this.formData;

      if (!phone || !email || !password || !confirmPassword) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }

      if (!this.validatePhone(phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return;
      }

      if (!this.validateEmail(email)) {
        uni.showToast({
          title: '请输入正确的邮箱地址',
          icon: 'none'
        });
        return;
      }

      if (password.length < 6 || password.length > 20) {
        uni.showToast({
          title: '密码长度为6-20位',
          icon: 'none'
        });
        return;
      }

      if (password !== confirmPassword) {
        uni.showToast({
          title: '两次密码输入不一致',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '注册中...'
      });

      uni.request({
        url: '/api/register',
        method: 'POST',
        data: {
          phone: phone,
          email: email,
          password: password
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            this.userId = res.data.userId;
            this.showVerification = true;
            uni.showToast({
              title: '验证码已发送',
              icon: 'success'
            });
          } else {
            uni.showToast({
              title: res.data.message || '注册失败',
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
    handleVerify() {
      if (!this.verificationCode || this.verificationCode.length !== 6) {
        uni.showToast({
          title: '请输入6位验证码',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '验证中...'
      });

      uni.request({
        url: '/api/verify-email',
        method: 'POST',
        data: {
          userId: this.userId,
          code: this.verificationCode
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            uni.showToast({
              title: '注册成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '验证失败',
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
    resendCode() {
      this.handleRegister();
    },
    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
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
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/login'
          });
        }, 1500);
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
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
}

.header {
  padding: 80rpx 40rpx 60rpx;
  text-align: center;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  border-radius: 16rpx;
}

.header-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 20rpx;
}

.header-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-scroll {
  height: calc(100vh - 400rpx);
}

.form-container {
  padding: 40rpx;
}

.form-content,
.verification-content {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24rpx;
  padding: 48rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.input:focus {
  background: #fff;
  border-color: #d4af37;
}

.placeholder {
  color: #999;
}

.register-btn,
.verify-btn {
  margin-top: 60rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
}

.register-text,
.verify-text {
  font-size: 32rpx;
  color: #1a5490;
  font-weight: bold;
}

.login-link {
  margin-top: 40rpx;
  text-align: center;
}

.link-text {
  font-size: 26rpx;
  color: #666;
}

.link-btn {
  font-size: 26rpx;
  color: #1a5490;
  font-weight: bold;
  margin-left: 8rpx;
}

.verification-header {
  text-align: center;
  margin-bottom: 48rpx;
}

.verification-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #1a5490;
  margin-bottom: 16rpx;
}

.verification-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.verification-input {
  text-align: center;
  letter-spacing: 8rpx;
  font-size: 36rpx;
  font-weight: bold;
}

.resend-link {
  margin-top: 32rpx;
  text-align: center;
}

.resend-text {
  font-size: 26rpx;
  color: #1a5490;
  text-decoration: underline;
}

.balance-section {
  margin-top: 40rpx;
  padding: 32rpx;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 16rpx;
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
  color: #666;
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