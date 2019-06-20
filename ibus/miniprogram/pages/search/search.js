// pages/search/search.js
var app=getApp();
var qqmapsdk = app.globalData.qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history_places: [{ name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" }, { name: "武汉大学" },],
  
    searchProvince:"",//"湖北省",
    searchCity:"",//"武汉市",
  },
  loghistory(){
    wx.switchTab({
      url: '../index/index',
    })
  },

  //TODO
  get_search:function(e){
    //app.globalData.search_place = e.detail.value
    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      region: this.data.searchCity,
      filter: encodeURI("category=公交车站"),
      success: function (res) {
        console.log(res);
        var sug=[];
        /*for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }*/
      },
      fail: function (error) {
        //console.error(error);
      },
      complete: function (res) {
        //console.log(res);
      }
    })
  },
  Routine:function(){

    wx.switchTab({
      url: '../index/index' ,
    })
  },

  onLoad: function (options) {
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
  
  onShow:function(options){

  },

})