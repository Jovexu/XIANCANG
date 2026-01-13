<template>
  <view id="app">
    <view class="app-container">
      <router-view />
    </view>
  </view>
</template>

<script>
export default {
  onLaunch() {
    console.log('国际海运对对碰应用启动');
    this.checkUpdate();
  },
  onShow() {
    console.log('应用显示');
  },
  onHide() {
    console.log('应用隐藏');
  },
  methods: {
    checkUpdate() {
      if (uni.canIUse('getUpdateManager')) {
        const updateManager = uni.getUpdateManager();
        updateManager.onCheckForUpdate((res) => {
          if (res.hasUpdate) {
            updateManager.onUpdateReady(() => {
              uni.showModal({
                title: '更新提示',
                content: '新版本已准备好，是否重启应用？',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    updateManager.applyUpdate();
                  }
                }
              });
            });
            updateManager.onUpdateFailed(() => {
              uni.showModal({
                title: '更新失败',
                content: '新版本下载失败，请稍后重试',
                showCancel: false
              });
            });
          }
        });
      }
    }
  }
};
</script>

<style>
@import url('https://fonts.loli.net/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

page {
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
  font-family: 'Noto Sans SC', 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

uni-input {
  height: auto !important;
  min-height: 0 !important;
  line-height: normal !important;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}

view {
  box-sizing: border-box;
}

button::after {
  border: none;
}

.safe-area-inset-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

.text-primary {
  color: #1a5490;
}

.text-gold {
  color: #d4af37;
}

.text-white {
  color: #fff;
}

.text-gray {
  color: #666;
}

.text-light-gray {
  color: #999;
}

.bg-primary {
  background: linear-gradient(135deg, #1a5490 0%, #0d3a6b 100%);
}

.bg-gold {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
}

.bg-white {
  background: #fff;
}

.shadow-sm {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.shadow-md {
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.shadow-lg {
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.2);
}

.radius-sm {
  border-radius: 8rpx;
}

.radius-md {
  border-radius: 12rpx;
}

.radius-lg {
  border-radius: 16rpx;
}

.radius-xl {
  border-radius: 24rpx;
}

.radius-full {
  border-radius: 50%;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.text-bold {
  font-weight: bold;
}

.text-sm {
  font-size: 24rpx;
}

.text-md {
  font-size: 28rpx;
}

.text-lg {
  font-size: 32rpx;
}

.text-xl {
  font-size: 36rpx;
}

.text-2xl {
  font-size: 48rpx;
}

.mb-sm {
  margin-bottom: 16rpx;
}

.mb-md {
  margin-bottom: 24rpx;
}

.mb-lg {
  margin-bottom: 32rpx;
}

.mt-sm {
  margin-top: 16rpx;
}

.mt-md {
  margin-top: 24rpx;
}

.mt-lg {
  margin-top: 32rpx;
}

.p-sm {
  padding: 16rpx;
}

.p-md {
  padding: 24rpx;
}

.p-lg {
  padding: 32rpx;
}

.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  color: #1a5490;
  font-weight: bold;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(212, 175, 55, 0.4);
  transition: all 0.3s;
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(212, 175, 55, 0.3);
}

.card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
  margin: 24rpx 0;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(212, 175, 55, 0.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>