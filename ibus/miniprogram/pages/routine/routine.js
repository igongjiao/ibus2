// pages/routine/routine.js
Page({

  data: {
    history_routine: [{ start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" },]
  },
  Delete_history:function (){
    this.setData({
      history_routine:null
    })
  },
  search:function(){
    wx.navigateTo({
      url: '../guide/guide',
    })
  }
  
})