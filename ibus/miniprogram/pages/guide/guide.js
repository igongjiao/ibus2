// miniprogram/pages/guide/guide.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    routines:[{bus_number:"513",getOn_station:"珞瑜东路佳园路",station_number:20,time:"1小时30分",walking_distance:"1.6公里"},
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },
      { bus_number: "513", getOn_station: "珞瑜东路佳园路", station_number: 20, time: "1小时30分", walking_distance: "1.6公里" },]
  },
  show_info:function(){
    wx.navigateTo({
      url: '../routine_info/routine_info',
    })
  }

})