//index.js
//引入工具类
const util = require('../../utils/util.js')
// // 引入SDK核心类
let QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');

// 实例化API核心类
let qqmapsdk = new QQMapWX({
  key: 'I7OBZ-MZACP-B4PDK-VHGRK-H3THE-ZTBHC'
});

//获取应用实例
var app = getApp()
app.globalData.qqmapsdk = qqmapsdk;
//地图动态更新使用的参数
var mapLoadCountdown = 4;
var mapRefreshCountdown = 0;
const markerLabelFontScale = 12;
Page({
  data: {
    bus: [{
        bus_number: "781",
        collected: false
      },
      {
        bus_number: "781",
        collected: false
      },
      {
        bus_number: "781",
        collected: false
      },
      {
        bus_number: "781",
        collected: false
      },
      {
        bus_number: "781",
        collected: false
      },
      {
        bus_number: "781",
        collected: false
      },
      {
        bus_number: "781",
        collected: false
      },
    ],
    location: {
      name: "华中科技大学",
      distance: "20m",
      position: "武汉洪山区珞喻路关山口",
      type: "大学",
      collected: false
    },
    show1: false,
    place: '',
    scrollTop: 0,


    //用户坐标
    latitude: 0,
    longitude: 0,
    //地图放大倍数
    scale: 17,
    markerScale: 17,
    markerLabelScale: 12,
    //用户所在城市信息
    province: "湖北省",
    city: "武汉",

    //地图中的图标
    markers: [],
    mapCircle: [{
      latitude: 0,
      longitude: 0,
      color: "#6666FFAA",
      fillColor: "#6666FFAA",
      radius: 15,
    }],
    busicon: "../../image/busicon.png",
    //缩放视野以包含所有给定的坐标点
    includePoints: [],

    //显示车站数据列表
    stationInfo: {
      valid: false,
      title: "",
      distance: 0,
      duration: 0,
      busList: [],
    },
  },

  /**
   * 生命周期函数--监听页面加载   获取用户当前位置
   */
  onLoad: function(options) {
    wx.cloud.init();
    let _page = this;
    //获取用户坐标经纬度
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        _page.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          scale: 17
        });
        wx.setStorageSync('userlatlng', {
          lat: res.latitude,
          lng: res.longitude
        });
        //console.log(res);

        //获取用户位置信息
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            _page.setData({
              province: res.result.address_component.province,
              city: res.result.address_component.city,
            });
            app.globalData.searchCity = res.result.address_component.city;
            wx.setStorageSync('searchRegion', {
              province: res.result.address_component.province,
              city: res.result.address_component.city,
            });
          },
          fail: function(res) {
            util.logError("位置名称获取失败");
          },
          complete: function(res) {}
        })

        qqmapsdk.search({
          keyword: '站',
          page_size: 18,
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          filter: encodeURI("category=公交车站"),
          success: function(res) {
            console.log(res);
            var mks = [];
            var includeP = [];
            for (var i = 0; i < res.data.length; i++) {
              mks.push({
                id: i,
                //title: res.data[i].title,
                label: {
                  content: res.data[i].title.split("[")[0] + "站",
                  color: "#424200",
                  fontSize: _page.data.markerLabelScale,
                  borderWidth: 0,
                  x: -res.data[i].title.length - 25,
                  y: 0,
                },
                stationID: res.data[i].id,
                bus: res.data[i].address,
                latitude: res.data[i].location.lat,
                longitude: res.data[i].location.lng,
                province: res.data[i].ad_info.province,
                city: res.data[i].ad_info.city,
                district: res.data[i].ad_info.district,
                iconPath: _page.data.busicon,
                alpha: 0.7,
                width: _page.data.markerScale,
                height: _page.data.markerScale,
              });
              includeP.push({
                latitude: res.data[i].location.lat,
                longitude: res.data[i].location.lng,
              });
            }
            //添加用户坐标到缩放适应数组
            // includeP.push({
            //   latitude: _page.data.latitude,
            //   longitude: _page.data.longitude,
            // })
            _page.setData({
              markers: mks,
              scale: 17,
              includePoints: includeP
            });
          },
          fail: function(res) {
            util.logError("车站信息获取失败");
          }
        })
      },
      fail: function(res) {
        util.logError("位置坐标获取失败");
      },

    })

  },

  //TODO
  onShow: function(options) {
    let _page = this;
    if (app.globalData.selectStation != null) {
      var selectStation = app.globalData.selectStation;
      var mapMarkers = _page.data.markers;
      var markerNum = -1;
      console.log(app.globalData.selectStation);
      for (var i = 0; i < mapMarkers.length; i++) {
        if (selectStation.title == mapMarkers[i].label.content.slice(0, -1) &&
          selectStation.location.latitude == mapMarkers[i].latitude &&
          selectStation.location.longitude == mapMarkers[i].longitude) {
          markerNum = i;
          break;
        }
      }
      if (markerNum == -1) {
        if (mapMarkers.length > 18) {
          mapMarkers = mapMarkers.slice(0, 18);
        }

        mapMarkers[17] = {
          id: 17,
          label: {
            content: selectStation.title + "站",
            color: "#424200",
            fontSize: _page.data.markerLabelScale,
            borderWidth: 0,
            x: -selectStation.title.length - 25,
            y: 0,
          },
          stationID: "null",
          bus: selectStation.bus,
          latitude: selectStation.location.lat,
          longitude: selectStation.location.lng,
          province: "null",
          city: selectStation.city,
          district: "null",
          iconPath: _page.data.busicon,
          alpha: 0.7,
          width: _page.data.markerScale,
          height: _page.data.markerScale,
        }

        markerNum = 17;
      }
      let includeP = [];
      includeP.push({
        latitude: selectStation.location.lat,
        longitude: selectStation.location.lng,
      });
      _page.setData({
        markers: mapMarkers,
        includePoints: includeP,
        scale: 19,
      });
      _page.TapMapMarker({
        markerId: markerNum
      });
    }
  },

  //TODO
  setStationInfoEmpty() {
    _page = this;
    _page.setData({
      stationInfo: {
        valid: false,
        title: "",
        distance: 0,
        duration: 0,
        busList: [],
      },
    });
  },



  //事件处理函数
  RefreshMapMarkers: function(e) {
    let _page = this;
    if (e.type == "begin") return;
    if (mapLoadCountdown > 0) {
      mapLoadCountdown -= 1;
      return;
    }
    // if (mapRefreshCountdown>0) {
    //   mapRefreshCountdown -= 1;
    //   return;
    // } else { mapRefreshCountdown = 2;}

    this.mapCtx = wx.createMapContext("myMap");
    this.mapCtx.getCenterLocation({
      type: 'gcj02',
      success: function(resL) {
        qqmapsdk.search({
          keyword: '站',
          page_size: 14,
          location: {
            latitude: resL.latitude,
            longitude: resL.longitude
          },
          filter: encodeURI("category=公交车站"),
          success: function(res) {
            var mks = _page.data.markers;
            let markersLength = _page.data.markers.length;
            let num = 0;
            if (mks.length > 35) {
              console.log("mks.length>80")
              mks = mks.slice(0, 18);
              markersLength = 18;
            }
            for (var i = 0; i < res.data.length; i++) {
              let repeat = false;
              for (var n = 0; n < markersLength; n++) {
                if (_page.data.markers[n].stationID == res.data[i].id) {
                  repeat = true;
                  break;
                }
              }
              if (repeat) {
                continue;
              }
              //console.log(_page.data.markerLabelScale);
              mks.push({
                id: num + markersLength,
                //title: res.data[i].title,
                label: {
                  content: res.data[i].title.split("[")[0] + "站",
                  color: "#424200",
                  fontSize: _page.data.markerLabelScale,
                  borderWidth: 0,
                  x: -res.data[i].title.length - 25,
                  y: 0,
                },
                stationID: res.data[i].id,
                bus: res.data[i].address,
                latitude: res.data[i].location.lat,
                longitude: res.data[i].location.lng,
                province: res.data[i].ad_info.province,
                city: res.data[i].ad_info.city,
                district: res.data[i].ad_info.district,
                iconPath: _page.data.busicon,
                alpha: 0.7,
                width: _page.data.markerScale,
                height: _page.data.markerScale,
              });
              num += 1;
            }
            _page.setData({
              markers: mks,
            });
            console.log(mks);
          },
          fail: function(res) {
            util.logError("车站信息获取失败");
          }
        });
      }
    });
  },

  TapMapMarker: function(options) {
    let _page = this;
    //console.log(options.markerId);
    let title = _page.data.markers[options.markerId].label.content;

    _page.setData({
      "mapCircle[0].latitude": _page.data.markers[options.markerId].latitude,
      "mapCircle[0].longitude": _page.data.markers[options.markerId].longitude,
    });

    qqmapsdk.calculateDistance({
      mode: 'driving',
      from: {
        latitude: _page.data.latitude,
        longitude: _page.data.longitude
      },
      to: [{
        latitude: _page.data.markers[options.markerId].latitude,
        longitude: _page.data.markers[options.markerId].longitude
      }],
      success: function(res) {
        console.log(res);
        var res = res.result;
        _page.setData({
          stationInfo: {
            valid: true,
            title: title,
            busList: _page.data.markers[options.markerId].bus.split(","),
            province: _page.data.markers[options.markerId].province,
            city: _page.data.markers[options.markerId].city,
            district: _page.data.markers[options.markerId].district,
            distance: res.elements[0].distance,
            duration: (res.elements[0].duration / 60 + 2).toFixed(2)
          },
          show1: true
        });
        console.log(_page.data.stationInfo);
      },
      fail: function(res) {
        util.logError("车站距离获取失败");
      }
    });
  },

  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  UnShowMapText: function() {
    let _page = this;
    if (_page.data.markerLabelScale == 0) {
      _page.setData({
        markerLabelScale: markerLabelFontScale,
      });
      for (var i = 0; i < _page.data.markers.length; i++) {
        let str = "markers[" + i + "].label.fontSize"
        let str1 = "markers[" + i + "].label.color"
        _page.setData({
          //[str]: _page.data.markerLabelScale,
          [str1]: "#424200",
        });
      }
    } else {
      _page.setData({
        markerLabelScale: 0,
      });
      for (var i = 0; i < _page.data.markers.length; i++) {
        let str = "markers[" + i + "].label.fontSize"
        let str1 = "markers[" + i + "].label.color"
        _page.setData({
          //[str]: 0,
          [str1]: "#42420000",
        });
      }
    }
  },

  RelocatingMapCenter: function() {
    let _page = this;
    let includeP = [];
    includeP.push({
      latitude: _page.data.latitude,
      longitude: _page.data.longitude,
    });
    _page.setData({
      includePoints: includeP,
      scale: 17,
    })
  },

  Search: function() {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  Switch_show: function() {
    if (!this.data.stationInfo.valid) return;
    var show_hidden = this.data.show1
    this.setData({
      show1: (!show_hidden)
    })
    //console.log(app.globalData.show_info)
  },
  Collect_bus: function(e) {
    var that = this
    var index = parseInt(e.currentTarget.dataset.index)
    var x = !this.data.bus[index].collected
    var bus = that.data.bus
    if (x == true) {
      var key = "bus[" + index + "].collected"
      that.setData({
        [key]: true
      })
    }

    if (x == false) {
      var key = "bus[" + index + "].collected"
      that.setData({
        [key]: false
      })
    }
  },
  Select_bus: function() {
    wx.navigateTo({
      url: '../bus_diagram/bus_diagram',
    })
  },

  Collect_location: function() {
    var that = this
    var collected = !this.data.location.collected
    var key = "location.collected"
    if (collected == false) {
      this.setData({
        [key]: collected
      })
    } else {
      this.setData({
        [key]: collected
      })
    }
  },
  Guide: function() {
    wx.navigateTo({
      url: '../routine/routine',
    })
  },
})