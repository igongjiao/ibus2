// miniprogram/pages/guide/guide.js
const util = require('../../utils/util.js')
var app = getApp();
var qqmapsdk = app.globalData.qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: { 
    routineList:[],
    /*{
      busName:["513","555"],
      getOn_station: "珞瑜东路佳园路",
      station_number: 20,
      time: "1小时30分",
      walking_distance: "1.6公里",
      steps:[],
    }*/
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

  onShow: function () {
    let _page = this;
    var startD = app.globalData.startDirection;
    var endD = app.globalData.endDirection;
    app.globalData.routineD = null;
    if (startD != null && endD != null) {
      _page.setData({
        routineList: [],
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
      });

      ////////////////////////////////////////////////////////////////
      app.globalData.qqmapsdk.direction({
        mode: 'transit',
        policy: 'LEAST_TRANSFER,NO_SUBWAY',
        from: {
          latitude: startD.lat,
          longitude: startD.lng
        },
        to: {
          latitude: endD.lat,
          longitude: endD.lng
        },
        success: function (res) {
          console.log(res);
          var routes = res.result.routes;
          if (routes.length<=0)return;
          var routesList = [];
          for (var i = 0; i < routes.length;i++){
            let steps = routes[i].steps;
            let busName = [];
            let station_number = 0;
            let getOn_station = "";
            let walking_distance = 0;
            for (var n = 0; n < steps.length;n++){
              //console.log(steps[n]);
              if (steps[n].mode =="TRANSIT"){
                if (getOn_station == ""){
                  getOn_station = steps[n].lines[0].geton.title;
                }
                busName.push(steps[n].lines[0].title);
                station_number += steps[n].lines[0].station_count;
              } else if (steps[n].mode == "WALKING"){
                walking_distance += steps[n].distance;
              }
            }
            let aRoute = {
              id:i,
              time: util.minuteToHour(routes[i].duration),
              busName: busName,
              getOn_station: getOn_station,
              station_number: station_number,
              walking_distance: util.formatDistance(walking_distance),
              steps: steps,
            }
            routesList.push(aRoute);
          }
          _page.setData({
            routineList: routesList,
          });
          console.log(_page.data.routineList)
        }, fail: function (error) {
          util.logError("路线导航失败");
          console.log(error);
          //距离过近的路线规划
        },
      });          

    }
  },


  show_info:function(e){
    let _page = this;
    //console.log(e);
    let routineId = e.currentTarget.id;
    app.globalData.routineD = _page.data.routineList[routineId];
    console.log(app.globalData.routineD);

    wx.navigateTo({
      url: '../routine_info/routine_info',
    })
  }

})