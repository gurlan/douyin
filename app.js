//app.js


const Http = require('utils/request.js')
App({

    onLaunch: function () {
        // 展示本地存储能力
var that =this;
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
        // 登录
        if (!wx.getStorageSync('openid')) {
            wx.login({
                success: res => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    const params = {
                        js_code: res.code,
                    }

                    Http.HttpRequst(false, '/auth/login', false, '', params, 'GET', false, function (res) {
                        if (res.code == 200) {
                            wx.setStorageSync('openid', res.result.openid)
                            that.globalData.token = res.result

                        } else {
                            wx.redirectTo({
                                url: '/pages/login/login'
                            })
                        }
                    })
                    return false;
                }

            })
        }


    },

    globalData: {
        userInfo: null,
        token: ''
    }
})