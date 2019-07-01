// pages/routine/routine.js
const util = require('../../utils/util.js')
var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;

Page({

  data: {
    history_routine: [],

    searchCity: "武汉市$$$$$$$$",
    searchingCity: "",
    searchingCity2: "",

    searchTitle: "",
    searchTitle2: "",
    searchSuggests: [],
    searchSuggests2: [],

    startLocation: {
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

  onShow: function() {
    let _page = this;
    var startD = app.globalData.startDirection;
    var endD = app.globalData.endDirection;
    if (startD != null && endD != null) {
      _page.setData({
        startLocation: {
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
        },
        searchTitle: startD.title,
        searchTitle2: endD.title,
      });
    }
  },

  onLoad: function(options) {
    let _page = this;
    wx.getStorage({
      key: 'searchRegion',
      success(res) {
        _page.setData({
          //searchProvince: res.data.province,
          //searchCity: res.data.city,
          searchingCity: res.data.city,
          searchingCity2: res.data.city,
        });
      }
    })
    _page.setData({
      searchCity: app.globalData.searchCity,
    });
  },

  searchInfo: function(e) {
    let _page = this;
    //console.log(_page.data.startLocation);
    //console.log(_page.data.endLocation);
    if (_page.data.startLocation.fullInfo == false || _page.data.endLocation.fullInfo == false) {
      if (_page.data.startLocation.fullInfo == false) {
        if (_page.data.searchTitle == ""){return;}
        qqmapsdk.getSuggestion({
          keyword: _page.data.startLocation.title,
          region: _page.data.searchingCity,
          page_size: 10,
          page_index: 1,
          //region_fix: 1,
          success: function(res) {
            //console.log(res);
            if (res.data.length <= 0) {
              util.logError("无结果");
            }
            var startL = {
              fullInfo: true,
              title: res.data[0].title,
              lat: res.data[0].location.lat,
              lng: res.data[0].location.lng,
            }
            _page.setData({
              startLocation: startL
            });
            if (_page.data.endLocation.fullInfo == false) {
              if (_page.data.endLocation.title == "") { return; }
              qqmapsdk.getSuggestion({
                keyword: _page.data.endLocation.title,
                region: _page.data.searchingCity2,
                page_size: 10,
                page_index: 1,
                //region_fix: 1,
                success: function(res) {
                  //console.log(res);
                  if (res.data.length <= 0) {
                    util.logError("无结果2");
                  }
                  var endL = {
                    fullInfo: true,
                    title: res.data[0].title,
                    lat: res.data[0].location.lat,
                    lng: res.data[0].location.lng,
                  }
                  _page.setData({
                    endLocation: endL
                  });

                  //页面跳转
                  _page.switchPage();
                },
                fail: function(error) {
                  util.logError("搜素失败");
                }
              });
            } else {
              //页面跳转
              _page.switchPage();
            }
          },
          fail: function(error) {
            util.logError("起点搜素失败");
          }
        });
      } else {
        if (_page.data.endLocation.title == "") { return; }
        qqmapsdk.getSuggestion({
          keyword: _page.data.endLocation.title,
          region: _page.data.searchingCity2,
          page_size: 10,
          page_index: 1,
          //region_fix: 1,
          success: function(res) {
            //console.log(res);
            if (res.data.length <= 0) {
              util.logError("无结果2");
            }
            var endL = {
              fullInfo: true,
              title: res.data[0].title,
              lat: res.data[0].location.lat,
              lng: res.data[0].location.lng,
            }
            _page.setData({
              endLocation: endL
            });

            //页面跳转
            _page.switchPage();
          },
          fail: function(error) {
            util.logError("搜素失败");
          }
        });
      }
    } else {
      //页面跳转
      _page.switchPage();
    }
  },

  switchPage() {
    let _page = this;
    _page.setData({
      searchSuggests: [],
      searchSuggests2: [],
    });
    //console.log(_page.data.startLocation)
    //console.log(_page.data.endLocation)


    app.globalData.startDirection = _page.data.startLocation;
    app.globalData.endDirection = _page.data.endLocation;
    //页面跳转TODO
    wx.navigateTo({
      url: '../guide/guide',
    });

  },

  get_search: function(e) {
    let _page = this;
    _page.setData({
      searchTitle: e.detail.value,
      searchingCity: _page.data.searchCity,
      searchSuggests: [],
      startLocation: {
        fullInfo: false,
        title: e.detail.value,
        lat: 0,
        lng: 0,
      },
    });
    if (e.detail.value == "") {
      return;
    }
    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      region: _page.data.searchingCity,
      page_size: 10,
      page_index: 1,
      //region_fix: 1,
      success: function(res) {
        //console.log(res);
        let suggest = [];
        for (var i = 0; i < res.data.length && i < 9; i++) {
          suggest.push({
            id: i,
            title: res.data[i].title,
            city: res.data[i].city,
            location: res.data[i].location,
          });
        }
        _page.setData({
          searchSuggests: suggest
        });
      },
      fail: function(error) {
        util.logError("提示信息获取失败");
      }
    });
  },

  changeInput: function(e) {
    let _page = this;
    //console.log(e.currentTarget.id)
    let num = e.currentTarget.id;
    _page.setData({
      searchTitle: _page.data.searchSuggests[num].title,
      searchingCity: _page.data.searchSuggests[num].city,
      startLocation: {
        fullInfo: true,
        title: _page.data.searchSuggests[num].title,
        lat: _page.data.searchSuggests[num].location.lat,
        lng: _page.data.searchSuggests[num].location.lng,
      },
      searchSuggests: []
    });
  },

  get_search2: function(e) {
    let _page = this;
    _page.setData({
      searchTitle2: e.detail.value,
      searchingCity2: _page.data.searchCity,
      searchSuggests2: [],
      endLocation: {
        fullInfo: false,
        title: e.detail.value,
        lat: 0,
        lng: 0,
      },
    });
    if (e.detail.value == "") {
      return;
    }
    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      region: _page.data.searchingCity2,
      page_size: 10,
      page_index: 1,
      //region_fix: 1,
      success: function(res) {
        //console.log(res);
        let suggest = [];
        for (var i = 0; i < res.data.length && i < 9; i++) {
          suggest.push({
            id: i,
            title: res.data[i].title,
            city: res.data[i].city,
            location: res.data[i].location,
          });
        }
        _page.setData({
          searchSuggests2: suggest
        });
      },
      fail: function(error) {
        util.logError("提示信息获取失败");
      }
    });
  },

  changeInput2: function(e) {
    let _page = this;
    //console.log(e.currentTarget.id)
    let num = e.currentTarget.id;
    _page.setData({
      searchTitle2: _page.data.searchSuggests2[num].title,
      searchingCity2: _page.data.searchSuggests2[num].city,
      endLocation: {
        fullInfo: true,
        title: _page.data.searchSuggests2[num].title,
        lat: _page.data.searchSuggests2[num].location.lat,
        lng: _page.data.searchSuggests2[num].location.lng,
      },
      searchSuggests2: []
    });
  },


  Delete_history: function() {
    this.setData({
      history_routine: null
    })
  },

  search: function() {
    wx.navigateTo({
      url: '../guide/guide',
    })
  }

})