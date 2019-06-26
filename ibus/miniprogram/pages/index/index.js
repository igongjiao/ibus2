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
    bus: [
      {
        bus_number: "781", collected: false
      },
      {
        bus_number: "781", collected: false
      },
      {
        bus_number: "781", collected: false
      },
      {
        bus_number: "781", collected: false
      },
      {
        bus_number: "781", collected: false
      },
      {
        bus_number: "781", collected: false
      },
      {
        bus_number: "781", collected: false
      },],
    location: { name: "华中科技大学", distance: "20m", position: "武汉洪山区珞喻路关山口", type: "大学", collected: false },
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
    id: ''//获取id

  },

  /**
   * 生命周期函数--监听页面加载   获取用户当前位置
   */
  onLoad: function(options) {

    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openid)
        app.globalData.openid = res.result.openId;

      }
    })


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
    if (e.type=="begin")return;
    if (mapLoadCountdown>0){
      mapLoadCountdown -=1;
      return;
    } 
    // if (mapRefreshCountdown>0) {
    //   mapRefreshCountdown -= 1;
    //   return;
    // } else { mapRefreshCountdown = 2;}

    this.mapCtx = wx.createMapContext("myMap");
    this.mapCtx.getCenterLocation({
      type: 'gcj02',
      success: function (resL) {
        qqmapsdk.search({
          keyword: '站',
          page_size: 14,
          location: {
            latitude: resL.latitude,
            longitude: resL.longitude
          },
          filter: encodeURI("category=公交车站"),
          success: function (res) {
            var mks = _page.data.markers;
            let markersLength = _page.data.markers.length;
            let num = 0;
            if (mks.length > 35) {
              console.log("mks.length>80")
              mks = mks.slice(0,18);
              markersLength = 18;
            }
            for (var i = 0; i < res.data.length; i++) {
              let repeat = false;
              for (var n = 0; n < markersLength;n++){
                if (_page.data.markers[n].stationID == res.data[i].id) { repeat=true;break; }
              }
              if(repeat){
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
          fail: function (res) {
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



          show1: true,
          
          
        });





//初始化站点收藏开始

        const db = wx.cloud.database()

        var c = db.collection('something').where({
          _openid: app.globalData.openid,
          station: _page.data.stationInfo.title
        }).get({
          success: function (res) {
            console.log('成功')
            if (res.data.length!=0){
              _page.setData({
                "location.collected": true
              })
            }else{
              _page.setData({
                "location.collected": false
              })
            }
            
          },
          fail: function (res) {
            console.log('失败')
            
          }
        })
//初始化站点收藏结束
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
        markerLabelScale : markerLabelFontScale,
      });
      for (var i = 0; i < _page.data.markers.length; i++) {
        let str = "markers[" + i + "].label.fontSize"
        _page.setData({
          [str]: _page.data.markerLabelScale
        });
      }
    } else {
      _page.setData({
        markerLabelScale: 0,
      });
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
    var show_hidden = this.data.show1
    this.setData({
      show1: (!show_hidden)
    })
    //console.log(app.globalData.show_info)
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
  },

  Collect_location:function(){
    const db = wx.cloud.database()
    const _ = db.command
    var station = this.data.stationInfo.title
    var that=this
    var collected =!this.data.location.collected
    var openid 
    var key = "location.collected"
    //收藏或取消收藏站点
    if (collected==false){ 
      db.collection('something').where({
        _openid: _.eq(app.globalData.openid),
        station: station
      }).get().then(res => {
        /*that.setData({
          id: res.data[0]._id
        })*/
        console.log(res.data);            
        that.setData({                      
        id: res.data[0]._id          
        })

      })

      db.collection('something').doc(that.data.id).remove({
        success: console.log,
        fail: console.error
      })
      this.setData({
         [key]: collected
       })
      }
      else{
      
      console.log(station);
      
      db.collection('something').add({
        // data 字段表示需新增的 JSON 数据        
        data: {
          station: station,
        }, success: function (res) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id          
          console.log(res);
          console.log(res.errMsg);
        }
      });//收藏或取消收藏站点
        this.setData({
          [key]: collected
        })
      }
  },
  Guide: function () {
    wx.navigateTo({
      url: '../routine/routine',
    })
  },
})

