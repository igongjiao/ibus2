var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;
const util = require('../../utils/util.js');

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
    station: [{
      message: "",
      collected: false
    }],
    routine: [{
      message: "",
      collected: false
    }],
    windowHeight: 0,
    scrollViewHeight: 0,

    id: ''
  },

  switchStationPage: function(option) {
    let _page = this;
    let stationName = option.currentTarget.id;

    app.globalData.qqmapsdk.search({
      keyword: stationName,
      region: "武汉市",
      page_size: 10,
      page_index: 1,
      filter: encodeURI("category=公交车站"),
      success: function(res) {
        let stationlist = [];
        if (res.data.length > 0) {
          stationlist.push({
            title: res.data[0].title.split("[")[0],
            city: res.data[0].ad_info.city,
            bus: res.data[0].address,
            location: res.data[0].location,
          });
          app.globalData.selectStation = stationlist[0];
          wx.switchTab({
            url: '../index/index',
          })
        }
      },
      fail: function(error) {
        util.logError("地点信息获取失败");
        return;
      }
    });
  },

  switchBusPage: function (option) {
    let _page = this;
    let busName = option.currentTarget.id;
    let busInfo = {
      fullInfo: false,
      title: busName,
      city: "武汉市",
      startStation: "",
      endStation: "",
    };
    app.globalData.selectBus = busInfo;
    wx.navigateTo({
      url: '../bus_diagram/bus_diagram',
    });

  },

  onLoad: function(option) {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      },
    })
    let scrollViewHeight = this.data.windowHeight - 50
    this.setData({
      scrollViewHeight: scrollViewHeight
    })
  },
  onShow: function(option) {

    const db = wx.cloud.database()
    var that = this
    //显示收藏站点
    db.collection('something').where({
      _openid: app.globalData.openid,
    }).get({
      success: function(res) {
        var station = that.data.station
        for (var i = 0; i < res.data.length; i++) {

          var key = "station[" + i + "].message"
          var key2 = "station[" + i + "].collected"
          that.setData({
            [key]: res.data[i].station,
            [key2]: true
          })
        }

      },
      fail: function(res) {
        console.log()
      }
    })
    //显示收藏线路
    db.collection('route').where({
      _openid: app.globalData.openid,
    }).get({
      success: function(res) {
        var station = that.data.station
        for (var i = 0; i < res.data.length; i++) {

          var key = "routine[" + i + "].message"
          var key2 = "routine[" + i + "].collected"
          console.log(res.data[i].route)
          that.setData({
            [key]: res.data[i].route,
            [key2]: true
          })
        }

      },
      fail: function(res) {
        console.log()
      }
    })

  },
  /**
   * 点击导航栏
   */
  onNavBarTap: function(e) {
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
  onBindAnimationFinish: function({
    detail
  }) {
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: detail.current
    })
  },

  Collect_location: function (e) {
    const db = wx.cloud.database()
    const _ = db.command
    var station = this.data.station[e.currentTarget.dataset.index].message
    var that = this
    var collected = true
    var key = "station[" + e.currentTarget.dataset.index + "]collected"
    //取消收藏站点
    db.collection('something').where({
      _openid: _.eq(app.globalData.openid),
      station: station
    }).get().then(res => {
      that.setData({
        id: res.data[0]._id,
        [key]: false
      })
      db.collection('something').doc(this.data.id).remove({
        success: console.log,
        fail: console.error
      });
    });



  },

  Collect_route: function(e) {
    const db = wx.cloud.database()
    const _ = db.command
    var route = this.data.routine[e.currentTarget.dataset.index].message
    var that = this
    var collected = true
    var key = "routine[" + e.currentTarget.dataset.index + "]collected"
    //取消收藏站点
    console.log("线路");
    console.log(route);
    db.collection('route').where({
      _openid: _.eq(app.globalData.openid),
      route: route
    }).get().then(res => {

      that.setData({
        id: res.data[0]._id,
        [key]: false
      })
      db.collection('route').doc(this.data.id).remove({
        success: console.log,
        fail: console.error
      });
    });


  },
})