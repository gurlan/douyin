const app = getApp()
const Http = require('../../utils/request.js')
Page({
    data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo')
    },
    onLoad: function() {
        // 查看是否授权
        // 获取用户信息
        this.register()

    },
    bindGetUserInfo (e) {
        this.register()
    },
    register(){
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            app.globalData.userInfo = res.rawData

                            Http.HttpRequst(false, 'auth/register', false, '', res, 'POST', false, function (result) {
                                wx.setStorageSync('openid', result.result.openid)
                                app.globalData.token = result.result.openid
                                wx.redirectTo({
                                    url: '/pages/index/index'
                                })
                            })
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    }
})