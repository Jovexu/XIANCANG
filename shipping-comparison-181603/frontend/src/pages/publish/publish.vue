<template>
  <view class="publish-container">
    <view class="header">
      <view class="header-content">
        <text class="header-title">发布舱位</text>
        <text class="header-subtitle">分享您的现舱资源，快速匹配需求</text>
      </view>
    </view>

    <scroll-view scroll-y class="form-scroll">
      <view class="form-card">
        <!-- 航线信息 -->
        <view class="section">
          <view class="section-header">
            <text class="section-icon">🚢</text>
            <text class="section-title">航线信息</text>
          </view>
          
          <view class="route-inputs">
            <view class="input-group">
              <text class="label">起运港</text>
              <input 
                class="input" 
                v-model="formData.from_port" 
                placeholder="如: 上海" 
                placeholder-class="placeholder"
              />
            </view>
            <view class="route-arrow">→</view>
            <view class="input-group">
              <text class="label">目的港</text>
              <input 
                class="input" 
                v-model="formData.to_port" 
                placeholder="如: 洛杉矶" 
                placeholder-class="placeholder"
              />
            </view>
          </view>

          <view class="input-group mt-md">
            <text class="label">船公司</text>
            <input 
              class="input" 
              v-model="formData.shipping_company" 
              placeholder="如: COSCO, MAERSK" 
              placeholder-class="placeholder"
            />
          </view>
        </view>

        <view class="divider"></view>

        <!-- 舱位详情 -->
        <view class="section">
          <view class="section-header">
            <text class="section-icon">📦</text>
            <text class="section-title">舱位详情</text>
          </view>

          <view class="row">
            <view class="input-group half">
              <text class="label">柜型</text>
              <picker 
                mode="selector" 
                :range="containerTypes" 
                @change="onTypeChange"
                class="picker-container"
              >
                <view class="picker-content" :class="{'active': formData.container_type}">
                  {{ formData.container_type || '请选择' }}
                  <text class="picker-arrow">▼</text>
                </view>
              </picker>
            </view>
            <view class="input-group half">
              <text class="label">柜量</text>
              <input 
                class="input" 
                type="number" 
                v-model="formData.container_quantity" 
                placeholder="数量" 
                placeholder-class="placeholder"
              />
            </view>
          </view>

          <view class="input-group mt-md">
            <text class="label">运价 (USD)</text>
            <input 
              class="input price-input" 
              type="digit" 
              v-model="formData.price" 
              placeholder="0.00" 
              placeholder-class="placeholder"
            />
          </view>
        </view>

        <view class="divider"></view>

        <!-- 时间安排 -->
        <view class="section">
          <view class="section-header">
            <text class="section-icon">📅</text>
            <text class="section-title">时间安排</text>
          </view>

          <view class="input-group">
            <text class="label">截关日期</text>
            <picker mode="date" :start="today" @change="(e) => onDateChange('closing_date', e)">
              <view class="picker-content full" :class="{'active': formData.closing_date}">
                {{ formData.closing_date || '请选择截关日期' }}
                <text class="calendar-icon">📅</text>
              </view>
            </picker>
          </view>

          <view class="input-group mt-md">
            <text class="label">预计到港 (ETA)</text>
            <picker mode="date" :start="today" @change="(e) => onDateChange('eta', e)">
              <view class="picker-content full" :class="{'active': formData.eta}">
                {{ formData.eta || '请选择预计到港日期' }}
                <text class="calendar-icon">📅</text>
              </view>
            </picker>
          </view>

          <view class="input-group mt-md">
            <text class="label">运价有效期至</text>
            <picker mode="date" :start="today" @change="(e) => onDateChange('valid_until', e)">
              <view class="picker-content full" :class="{'active': formData.valid_until}">
                {{ formData.valid_until || '请选择有效期' }}
                <text class="calendar-icon">📅</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="divider"></view>

        <!-- 联系方式 -->
        <view class="section">
          <view class="section-header">
            <text class="section-icon">📱</text>
            <text class="section-title">联系方式</text>
          </view>
          
          <view class="input-group">
            <text class="label">联系电话/微信</text>
            <input 
              class="input" 
              v-model="formData.submitter_contact" 
              placeholder="请填写您的联系方式" 
              placeholder-class="placeholder"
            />
          </view>
        </view>

        <!-- 提交按钮 -->
        <view class="action-area">
          <view class="submit-btn" @click="handleSubmit">
            <text class="btn-text">确认发布</text>
          </view>
          <text class="tips">发布即代表您同意平台服务协议，请确保信息真实有效</text>
        </view>

      </view>
      <!-- 底部留白 -->
      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        from_port: '',
        to_port: '',
        price: '',
        container_type: '',
        container_quantity: '',
        shipping_company: '',
        closing_date: '',
        eta: '',
        valid_until: '',
        submitter_contact: ''
      },
      containerTypes: ['20GP', '40GP', '40HQ', '45HQ', '20RF', '40RF', 'SOC', 'OT'],
      today: new Date().toISOString().split('T')[0]
    };
  },
  onShow() {
    this.checkLogin();
  },
  methods: {
    checkLogin() {
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
      } else {
        // 尝试自动填充联系方式
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo && userInfo.phone) {
          this.formData.submitter_contact = userInfo.phone;
        }
      }
    },
    onTypeChange(e) {
      this.formData.container_type = this.containerTypes[e.detail.value];
    },
    onDateChange(field, e) {
      this.formData[field] = e.detail.value;
    },
    handleSubmit() {
      // 验证表单
      const requiredFields = [
        { key: 'from_port', name: '起运港' },
        { key: 'to_port', name: '目的港' },
        { key: 'shipping_company', name: '船公司' },
        { key: 'container_type', name: '柜型' },
        { key: 'container_quantity', name: '柜量' },
        { key: 'price', name: '运价' },
        { key: 'closing_date', name: '截关日期' },
        { key: 'eta', name: '预计到港日期' },
        { key: 'valid_until', name: '有效期' },
        { key: 'submitter_contact', name: '联系方式' }
      ];

      for (const field of requiredFields) {
        if (!this.formData[field.key]) {
          uni.showToast({
            title: `请填写${field.name}`,
            icon: 'none'
          });
          return;
        }
      }

      const token = uni.getStorageSync('token');
      if (!token) {
        uni.navigateTo({ url: '/pages/login/login' });
        return;
      }

      uni.showLoading({ title: '发布中...' });

      uni.request({
        url: '/api/publish',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: this.formData,
        success: (res) => {
          uni.hideLoading();
          if (res.data.success) {
            uni.showToast({
              title: '发布成功',
              icon: 'success'
            });
            // 延迟跳转回首页，并重置表单
            setTimeout(() => {
              this.resetForm();
              uni.switchTab({
                url: '/pages/index/index'
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '发布失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({
            title: '网络异常，请重试',
            icon: 'none'
          });
        }
      });
    },
    resetForm() {
      this.formData = {
        from_port: '',
        to_port: '',
        price: '',
        container_type: '',
        container_quantity: '',
        shipping_company: '',
        closing_date: '',
        eta: '',
        valid_until: '',
        submitter_contact: ''
      };
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

.publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
  display: flex;
  flex-direction: column;
}

.header {
  padding: 40rpx 40rpx 20rpx;
}

.header-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}

.header-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-scroll {
  flex: 1;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.form-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

.section {
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #1a5490;
}

.divider {
  height: 2rpx;
  background: #f0f0f0;
  margin: 32rpx 0;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.input {
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.input:focus {
  background: #fff;
  border-color: #d4af37;
}

.placeholder {
  color: #999;
  font-size: 26rpx;
}

.route-inputs {
  display: flex;
  align-items: flex-end;
  gap: 20rpx;
}

.route-arrow {
  font-size: 32rpx;
  color: #d4af37;
  font-weight: bold;
  padding-bottom: 20rpx;
}

.route-inputs .input-group {
  flex: 1;
}

.row {
  display: flex;
  gap: 24rpx;
}

.half {
  flex: 1;
}

.picker-content {
  height: 80rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
  color: #999;
  border: 2rpx solid transparent;
}

.picker-content.active {
  color: #333;
  background: #fff;
  border-color: #e0e0e0;
}

.picker-content.full {
  width: 100%;
  box-sizing: border-box;
}

.picker-arrow {
  font-size: 20rpx;
  color: #ccc;
}

.calendar-icon {
  font-size: 28rpx;
}

.price-input {
  color: #d4af37;
  font-weight: bold;
  font-size: 32rpx;
}

.mt-md {
  margin-top: 24rpx;
}

.action-area {
  margin-top: 40rpx;
  text-align: center;
}

.submit-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
  transition: all 0.3s;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(212, 175, 55, 0.3);
}

.btn-text {
  font-size: 32rpx;
  color: #1a5490;
  font-weight: bold;
  letter-spacing: 4rpx;
}

.tips {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 24rpx;
}

.bottom-spacer {
  height: 40rpx;
}
</style>