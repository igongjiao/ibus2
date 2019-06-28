var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarActiveIndex: 0,
    navbarTitle: [
      "站点收藏",
      "路线收藏",
    ],
    station: [{ message: "", collected: false}],
    routine: [{ message: 1 }, { message: 2 }, { message: 3 }, { message: 4 }, { message: 5 }, { message: 6 },
      { message: 1 }, { message: 2 }, { message: 3 }, { message: 4 }, { message: 5 }, { message: 6 },],
    windowHeight: 0,
    scrollViewHeight:0,
    id: ''
  },
  
  onLoad: function (option) {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight:res.windowHeight
        })
      },
    })
      console.log(that.data.windowHeight)
      let scrollViewHeight = this.data.windowHeight - 50
      this.setData({
        scrollViewHeight: scrollViewHeight
      })
  },
  onShow: function (option) {

    const db = wx.cloud.database()
    var that = this
    db.collection('something').where({
      _openid: app.globalData.openid,
    }).get({
      success: function (res) {
        console.log('成功')
        console.log(res.data.length)
        var station=that.data.station
        for (var i = 0; i < res.data.length; i++)
        {
          
          var key = "station[" + i + "].message"
          console.log(res.data[i].station)
          that.setData({
            [key]: res.data[i].station
          })
        }
        
      },
      fail: function (res) {
        console.log()
      }
    })
    
   
  },
  /**
   * 点击导航栏
   */
  onNavBarTap: function (e) {
    // 获取点击的navbar的index
    let navbarTapIndex = e.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: navbarTapIndex
    })
  },

  

  /**
   * 
   */
  onBindAnimationFinish: function ({ detail }) {
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: detail.current
    })
  },
  startPullDownRefresh: function () {
    wx.startPullDownRefresh();
    this.onLoad();
  },
  stopPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  Collect_location: function (e) {
    const db = wx.cloud.database()
    const _ = db.command
    var station = this.data.station[e.currentTarget.dataset.index].message
    var that = this
    var collected = true
    var key = "station[" + e.currentTarget.dataset.index + "]collected"
    //var key = "location.collected"
    //取消收藏站点
    console.log("站名");
    console.log(station);
    db.collection('something').where({
      _openid: _.eq(app.globalData.openid),
      station: station
    }).get().then(res => {
      
      console.log(res.data[0]._id);
      that.setData({
        id: res.data[0]._id,
        [key]:false
      })
      //this.data.id = res.data[0]._id
      console.log(this.data.id)
      db.collection('something').doc(this.data.id).remove({
        success: console.log,
        fail: console.error
      });
    });
    this.startPullDownRefresh();
    this.onLoad();
    this.onShow();

    //console.log(this.data.id)
    

    
  },
 
})