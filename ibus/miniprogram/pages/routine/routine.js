// pages/routine/routine.js
var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;

Page({

  data: {
    history_routine: [{ start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" },],
  

    startLocation:{
      fullInfo: false,
      title: "",
      lat: 0,
      lng: 0,
    },
    endLocation: {
      fullInfo: false,
      title: "",
      lat: 0,
      lng: 0,
    },
  },

  onShow: function () {
    let _page = this;
    var startD = app.globalData.startDirection;
    var endD = app.globalData.endDirection;

    _page.setData({
      startLocation:{
        fullInfo: startD.fullInfo,
        title: startD.title,
        lat: startD.lat,
        lng: startD.lng,
      },
      endLocation: {
        fullInfo: endD.fullInfo,
        title: endD.title,
        lat: endD.lat,
        lng: endD.lng,
      }
    });
  },

  Delete_history:function (){
    this.setData({
      history_routine:null
    })
  },
  search:function(){
    wx.switchTab({
      url: '../index/index',
    })
  }
  
})