// miniprogram/pages/routine_info/routine_info.js
const util = require('../../utils/util.js')
var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bus_number:"513",
    station_info: ["珞瑜东路光谷大道","珞瑜东路叶麻店","关谷广场","马家庄","卓刀泉","终点站"],
    start: "我的位置",      //输入的起始点
    destination: "武汉大学",    //输入的终点
    distance:"1300米",

    routine:null,
    steps:[],
  },

  onShow: function () {
    let _page = this;
    let steps = app.globalData.routineD.steps.slice(0);
    steps.pop();
    steps.shift();
    _page.setData({
      start: app.globalData.startDirection.title,
      destination: app.globalData.endDirection.title,
      routine: app.globalData.routineD,
      steps: steps,
    });
    console.log(steps);
    console.log(_page.data.routine);
  },
})