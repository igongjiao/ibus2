// //logs.js
// const util = require('../../utils/util.js')

// Page({
//   data: {
//     logs: []
//   },
//   onLoad: function () {
//     this.setData({
//       logs: (wx.getStorageSync('logs') || []).map(log => {
//         return util.formatTime(new Date(log))
//       })
//     })
//   }
// })


const app = getApp();
const amapsdk = app.globalData.amapsdk;

Page({
  data: {
    address: '',
    weather: '',
    temperature: '',
    humidity: '',
    windpower: '',
    winddirection: ''
  },
  onLoad() {
    var _this = this;
    amapsdk.getWeather({
      type: 'live',
      success(data) {
        console.log(data);
        if (data.city) {
          _this.setData({
            address: data.liveData.city,
            humidity: data.liveData.humidity,
            temperature: data.liveData.temperature,
            weather: data.liveData.weather,
            winddirection: data.liveData.winddirection,
            windpower: data.liveData.windpower
          })
        }
      },
      fail() {
        wx.showToast({ title: '失败！' })
      }
    })
  }
})
