// pages/search/search.js
//引入工具类
const util = require('../../utils/util.js')

var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history_places: [{
      name: "武汉大学"
    }, {
      name: "武汉大学"
    }, {
      name: "武汉大学"
    }, {
      name: "武汉大学"
    }, {
      name: "武汉大学"
    }, {
      name: "武汉大学"
    }, ],

    searchProvince: "", //"湖北省",
    searchCity: "", //"武汉市",



    searchTitle: "",

    startLocation: {
      searchTitle: "",
      latitude: 0,
      longitude: 0,
    },
    endLocation: {
      searchTitle: "",
      latitude: 0,
      longitude: 0,
    },

  },
  loghistory() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  //TODO
  get_search: function(e) {
    let _page = this;
    qqmapsdk.getSuggestion({
      keyword: "513", //e.detail.value,
      region: this.data.searchCity,
      page_size: 20,
      page_index: 1,
      region_fix: 1,
      filter: encodeURI("category=线路"),
      success: function(res) {
        console.log(res);
        if (res.data.length == 0) return;
        let str = res.data[0].address.split("--");
        _page.setData({
          searchTitle: res.data[0].title,
          "startLocation.searchTitle": str[0],
          "endLocation.searchTitle": str[1],
        });
      },
      fail: function(error) {
        util.logError("提示信息获取失败");
      }
    });

  },

  searchInfo: function() {
    let _page = this;
    _page.searchStation(_page.data.startLocation.searchTitle, "startLocation.latitude", "startLocation.longitude");
  },

  searchStation(keyword, latStr, lngStr) {
    let _page = this;
    qqmapsdk.search({
      keyword: keyword + "[公交站]",
      region: this.data.searchCity,
      page_size: 10,
      page_index: 1,
      region_fix: 1,
      filter: encodeURI("category=公交车站"),
      success: function(res) {
        console.log(res);
        let foundIndex = -1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].address.indexOf(_page.data.searchTitle) != -1 && res.data[i].title.indexOf(keyword) != -1) {
            foundIndex = i;
            break;
          }
        }
        if (foundIndex == -1) {
          util.logError("车站信息获取失败");
          return;
        }
        _page.setData({
          [latStr]: res.data[i].location.lat,
          [lngStr]: res.data[i].location.lng,
        });

        if (latStr == "startLocation.latitude") {
          _page.searchStation(_page.data.endLocation.searchTitle, "endLocation.latitude", "endLocation.longitude")
        } else {
          console.log(_page.data.startLocation);
          console.log(_page.data.endLocation);
          //页面跳转TODO
        }
      },
      fail: function(error) {
        util.logError("车站获取失败");
        return;
      }
    });
    return;
  },
  Routine: function() {

    wx.switchTab({
      url: '../index/index',
    })
  },

  onLoad: function(options) {
    let _page = this;
    wx.getStorage({
      key: 'searchRegion',
      success(res) {
        _page.setData({
          searchProvince: res.data.province,
          searchCity: res.data.city,
        });
        console.log(res);
      }
    })
  },

  onShow: function(options) {

  },

})