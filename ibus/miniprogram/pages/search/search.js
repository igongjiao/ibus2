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
    history_routines: [{ start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" }, { start: "华中科技大学", destination: "武汉大学" },],
    history_stations: [{ name: "佳园路" }, { name: "佳园路" }, { name: "佳园路" }, { name: "佳园路" }, { name: "佳园路" }, { name: "佳园路" },],
    history_places: [{ name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" },],
    routine_number: 3,
    station_number: 3,
    place_number: 3,


    searchProvince: "", //"湖北省",
    searchCity: "", //"武汉市",

    searchTitle: "",
    searchSuggests:[],
    searchStation:[],
    searchBus:[],
    searchPoint:[],

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
  changeInput: function (e) {
    let _page = this;
    //console.log(e.currentTarget.id)
    _page.setData({
      searchTitle: e.currentTarget.id,
      searchSuggests:[]
    });
  },

  get_search: function(e) {
    let _page = this;
    _page.setData({
      searchTitle: e.detail.value,
      searchSuggests:[],
    });

    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      region: this.data.searchCity,
      page_size: 10,
      page_index: 1,
      //region_fix: 1,
      //filter: encodeURI("category=线路"),
      success: function(res) {
        console.log(res);
        let suggest=[];
        for(var i=0;i<res.data.length && i<9;i++){
          suggest.push({
            title:res.data[i].title,
            city: res.data[i].city,
          });
        }
        _page.setData({
          searchSuggests:suggest
        });
      },
      fail: function(error) {
        util.logError("提示信息获取失败");
      }
    });
  },

  //TODO
  searchInfo: function() {
    let _page = this;
    qqmapsdk.search({
      keyword: _page.data.searchTitle,
      region: this.data.searchCity,
      page_size: 20,
      page_index: 1,
      //region_fix: 1,
      //filter: encodeURI("category=公交车站"),
      success: function (res) {
        console.log(res);
        if (res.data.length <= 0) {
          util.logError("搜素信息无结果");
          return;
        }

      },
      fail: function (error) {
        util.logError("搜素信息获取失败");
        return;
      }
    });


    //数据可能未加载完成TODO
    // wx.switchTab({
    //   url: '../index/index',
    // })

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

  
  check_more1:function(options){
    this.setData({
      routine_number:15,
      station_number:3,
      place_number:3
    })
  },
  check_more2: function (options) {
    this.setData({
      routine_number: 3,
      station_number: 15,
      place_number: 3
    })
  },
  check_more3: function (options) {
    this.setData({
      routine_number: 3,
      station_number: 3,
      place_number: 15
    })
  },

})