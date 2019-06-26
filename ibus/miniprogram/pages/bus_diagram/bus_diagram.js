// miniprogram/pages/bus_diagram/bus_diagram.js
//引入工具类
const util = require('../../utils/util.js')

var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bus_info: {
      start: "珞雄路公交场站",
      destination: "碧桂园公交场站",
      start_time: "6:30",
      end_time: "22:00",
      price: 2
    },
    bus_stations: [{
      stationName: "光谷大道华中科技大学公交站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, {
      stationName: "珞雄路公交场站"
    }, ],
    station_number: 14,

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
    searchCity:"",
  },
  testTap: function () {
    let _page = this;
    console.log(_page.qqmapsdk);

  },
  onShow: function() {
    let _page = this;
    if (app.globalData.selectBus != null) {
      var selectBus = app.globalData.selectBus;
      console.log(selectBus);
      _page.setData({
        searchCity: selectBus.city,
      });
      if (selectBus.fullInfo==false){
        app.globalData.qqmapsdk.getSuggestion({
          keyword: selectBus.title,
          region: selectBus.city,
          page_size: 10,
          page_index: 1,
          region_fix: 1,
          filter: encodeURI("category=公交线路"),
          success: function (res) {
            //console.log(res);
            if (res.data.length == 0) { util.logError("起始站点获取失败"); return;}
            let str = res.data[0].address.split("--");
            _page.setData({
              "startLocation.searchTitle": str[0],
              "endLocation.searchTitle": str[1],
            });
            selectBus.startStation = str[0];
            selectBus.endStation = str[1];

            _page.searchStation(_page.data.startLocation.searchTitle, "startLocation.latitude", "startLocation.longitude");
          },
          fail: function (error) {
            util.logError("站点名称获取失败");
          }
        });
      }else{
        _page.setData({
          "startLocation.searchTitle": selectBus.startStation,
          "endLocation.searchTitle": selectBus.endStation,
        });
        _page.searchStation(_page.data.startLocation.searchTitle, "startLocation.latitude", "startLocation.longitude");
      }

    }
  },

  searchStation(keyword, latStr, lngStr) {
    let _page = this;
    app.globalData.qqmapsdk.search({
      keyword: keyword + "[公交站]",
      region: this.data.searchCity,
      page_size: 10,
      page_index: 1,
      region_fix: 1,
      filter: encodeURI("category=公交车站"),
      success: function (res) {
        console.log(res);
        let foundIndex = -1;
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].address.indexOf(app.globalData.selectBus.title) != -1 && res.data[i].title.indexOf(keyword) != -1) {
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
          _page.searchStation(_page.data.endLocation.searchTitle, "endLocation.latitude", "endLocation.longitude");
        } else {
          app.globalData.qqmapsdk.direction({
            mode: 'transit',
            from: {
              latitude: _page.data.startLocation.location.lat,
              longitude: _page.data.startLocation.location.lng
            },
            to: {
              latitude: _page.data.endLocation.location.lat,
              longitude: _page.data.endLocation.location.lng
            },
            success: function (res) {
              console.log("ok%%%%%%%%%%%%%55");

              console.log(res);

            }, fail: function (error) {
              console.log(error);
            },
          });
        }

      },
      fail: function (error) {
        util.logError("车站获取失败");
        return;
      }
    });
    return;
  },

})