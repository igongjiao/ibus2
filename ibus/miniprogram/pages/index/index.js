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
Page({
  data: {
    city: "武汉",
    bus: [
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // }, 
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
      // {
      //   bus_number: "781", destination: "武汉大学", station: "珞瑜东路佳园站", accuracy: "", wait_time: "45", collected: false
      // },
    ],
    show: false,
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
            wx.setStorageSync('searchRegion', {
              province: res.result.address_component.province,
              city: res.result.address_component.city,
            });
            //console.log("Success");
            //console.log(res.result.address_component.province);
          },
          fail: function(res) {
            util.logError("位置名称获取失败");
          },
          complete: function(res) {}
        })

        qqmapsdk.search({
          keyword: '站',
          page_size: 14,
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
      }
    })

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
  TapMapMarker: function(options) {
    let _page = this;
    //console.log(options.markerId);
    let title = _page.data.markers[options.markerId].label.content;

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
          show: true
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
    if (_page.data.markers[0].label.fontSize == 0) {
      for (var i = 0; i < _page.data.markers.length; i++) {
        let str = "markers[" + i + "].label.fontSize"
        _page.setData({
          [str]: _page.data.markerLabelScale
        });
      }
    } else {
      for (var i = 0; i < _page.data.markers.length; i++) {
        let str = "markers[" + i + "].label.fontSize"
        _page.setData({
          [str]: 0
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
    var show_hidden = this.data.show
    this.setData({
      show: (!show_hidden)
    })
  },
  Collect_routine: function(e) {
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
  Select_routine: function() {
    wx.navigateTo({
      url: '../routine/routine',
    })
  }
})