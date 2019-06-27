// pages/search/search.js
var app=getApp();
var qqmapsdk = app.globalData.qqmapsdk;
Page({

  data: {

    userName: '',

    userPassword: '',

    userPasswordAgain: '',

    checkbox: false,
    station_number:3,
    routine_number: 3,
    place_number: 3,

    searchProvince: "", //"湖北省",
    searchCity: "武汉市$$$$$$$$",

    searchingCity: "",
    searchTitle: "",
    searchSuggests: [],
    searchStation: [],
    searchBus: [],
    searchPoint: [],

    repetition: false

  },



  loghistory(){
    wx.switchTab({
      url: '../index/index',
    })
  },

  //TODO
  changeInput: function(e) {
    let _page = this;
    //console.log(e.currentTarget.id)
    let num = e.currentTarget.id;
    _page.setData({
      searchTitle: _page.data.searchSuggests[num].title,
      searchingCity: _page.data.searchSuggests[num].city,
      searchSuggests: []
    });
  },

  get_search: function(e) {
    let _page = this;
    _page.setData({
      searchTitle: e.detail.value,
      searchingCity: _page.data.searchCity,
      searchSuggests: [],
    });
    if (e.detail.value == "") { return; }
    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      region: this.data.searchingCity,
      page_size: 10,
      page_index: 1,
      //region_fix: 1,
      //filter: encodeURI("category=线路"),
      success: function(res) {
        //console.log(res);
        let suggest = [];
        for (var i = 0; i < res.data.length && i < 9; i++) {
          suggest.push({
            id: i,
            title: res.data[i].title,
            city: res.data[i].city,
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

  //TODO
  searchInfo: function() {
    let _page = this;
    _page.setData({
      searchSuggests: [],
    });
    if (_page.data.searchTitle==""){return;}
    qqmapsdk.getSuggestion({
      keyword: _page.data.searchTitle,
      region: this.data.searchingCity,
      page_size: 20,
      page_index: 1,
      //region_fix: 1,
      //filter: encodeURI("category=公交线路"),
      success: function(res) {
        //console.log(res);
        if (res.data.length > 0) {
          let buslist = [];
          let num = 0;
          for (var i = 0; i < res.data.length; i++) {
            //console.log(res.data[i].category.slice(-4));
            if (res.data[i].category.slice(-4) == "公交线路") {
              let str = res.data[i].address.split("--");
              buslist.push({
                id: num,
                title: res.data[i].title,
                city: res.data[i].city,
                startStation: str[0],
                endStation: str[1],
              });
              num += 1;
            }
          }
          _page.setData({
            searchBus: buslist,
          });
          //console.log(_page.data.searchBus);
        }
      },
      fail: function(error) {
        util.logError("线路信息获取失败");
        return;
      }
    });

    qqmapsdk.search({
      keyword: _page.data.searchTitle,
      region: this.data.searchingCity,
      page_size: 20,
      page_index: 1,
      success: function (res) {
        console.log(res);
        if (res.data.length > 0) {
          let stationlist = [];
          let locatelist = [];
          let stationNum = 0;
          let locateNum = 0;
          for (var i = 0; i < res.data.length; i++) {
            let categoryStr = res.data[i].category.slice(-4);
            if (categoryStr == "公交车站") {
              stationlist.push({
                id: stationNum,
                title: res.data[i].title.split("[")[0],
                city: res.data[i].ad_info.city,
                bus: res.data[i].address,
                location: res.data[i].location,
              });
              stationNum += 1;
            } else if (categoryStr != "公交线路"){
              locatelist.push({
                id: locateNum,
                title: res.data[i].title,
                city: res.data[i].ad_info.city,
                address: res.data[i].address,
                location: res.data[i].location,
              });
              locateNum += 1;
            }
          }
          _page.setData({
            searchStation: stationlist,
            searchPoint: locatelist,
          });
          //console.log(_page.data.station_number);
          console.log(_page.data.searchPoint);
        }
      },
      fail: function (error) {
        util.logError("地点信息获取失败");
        return;
      }
    });
    //数据可能未加载完成TODO
    // wx.switchTab({
    //   url: '../index/index',
    // })
  },

  onLoad: function (options) {
    let _page = this;
    wx.getStorage({
      key: 'searchRegion',
      success(res) {
        _page.setData({
          searchProvince: res.data.province,
          //searchCity: res.data.city,
          searchingCity: res.data.city,
        });
      }
    })
    _page.setData({
      searchCity: app.globalData.searchCity,
    });

  },

  switchStationPage(e){
    let idnum = e.target.id;
    let _page = this;
    let stationInfo = {
      title: _page.data.searchStation[idnum].title,
      city: _page.data.searchStation[idnum].city,
      bus: _page.data.searchStation[idnum].bus,
      location: _page.data.searchStation[idnum].location,
    };
    app.globalData.selectStation = stationInfo;
    wx.switchTab({
       url: '../index/index',
     })
  },

  //TODO
  switchBusPage(e) {
    let idnum = e.target.id;
    let _page = this;
    let busInfo = {
      fullInfo: true,
      title: _page.data.searchBus[idnum].title,
      city: _page.data.searchBus[idnum].city,
      startStation: _page.data.searchBus[idnum].startStation,
      endStation: _page.data.searchBus[idnum].endStation,
    };
    app.globalData.selectBus = busInfo;
    wx.navigateTo({
      url: '../bus_diagram/bus_diagram',
    })
  },

  switchDirectionPage(e){
    let idnum = e.target.id;
    let _page = this;
    app.globalData.startDirection = {
      title: "我的位置",
      fullInfo: true,
      lat: app.globalData.userLocation.lat,
      lng: app.globalData.userLocation.lng,
    };
    app.globalData.endDirection = {
      title: _page.data.searchPoint[idnum].title,
      fullInfo: true,
      lat: _page.data.searchPoint[idnum].location.lat,
      lng: _page.data.searchPoint[idnum].location.lng,
    };
    wx.switchTab({
      url: '../routine/routine',
    })
    wx.navigateTo({
      url: '../routine/routine',
    })
  },

  check_more1: function(options) {
    this.setData({
      routine_number: 15,
      station_number: 3,
      place_number: 3
    })
  },
  check_more2: function(options) {
    this.setData({
      routine_number: 3,
      station_number: 15,
      place_number: 3
    })
  },
  check_more3: function(options) {
    this.setData({
      routine_number: 3,
      station_number: 3,
      place_number: 15
    })
  },

})