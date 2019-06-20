Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbarActiveIndex: 0,
    navbarTitle: [
      "站点收藏",
      "路线收藏",
    ],
    station: [{ message: 1 }, { message: 2 }, { message: 3 }, { message: 4 }, { message: 5 }, { message: 6 },
      { message: 1 }, { message: 2 }, { message: 3 }, { message: 4 }, { message: 5 }, { message: 6 },],
    routine: [{ message: 1 }, { message: 2 }, { message: 3 }, { message: 4 }, { message: 5 }, { message: 6 },
      { message: 1 }, { message: 2 }, { message: 3 }, { message: 4 }, { message: 5 }, { message: 6 },],
    windowHeight: 0,
    scrollViewHeight:0,
  },
  onLoad: function (option) {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight:res.windowHeight
        })
      },
    })
      console.log(that.data.windowHeight)
      let scrollViewHeight = this.data.windowHeight - 50
      this.setData({
        scrollViewHeight: scrollViewHeight
      })
  },

  /**
   * 点击导航栏
   */
  onNavBarTap: function (e) {
    // 获取点击的navbar的index
    let navbarTapIndex = e.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: navbarTapIndex
    })
  },

  /**
   * 
   */
  onBindAnimationFinish: function ({ detail }) {
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    this.setData({
      navbarActiveIndex: detail.current
    })
  }
})