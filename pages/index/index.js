//index.js
//获取应用实例
import * as event from '../../utils/event.js'

const Http = require('../../utils/request.js')
const app = getApp()
var wsTask
Page({
    /**
     * 页面的初始数据
     */
    data: {
        percent: 1,
        current: 0,
        autoplay: true,
        controls: false,
        showPlayBtn: false,
        showProgress: false,
        playState: true,
        animationShow: false,
        currentTranslateY: 0,
        // 触摸开始时间
        touchStartTime: 0,
        // 触摸结束时间
        touchEndTime: 0,
        // 最后一次单击事件点击发生时间
        lastTapTime: 0,
        // 单击事件点击后要触发的函数
        lastTapTimeoutFunc: null,
        touchStartingY: 0,
        nowPage: 1,
        pageNo: 1,
        contentId: '',
        likeNum: 0,
        rows: 9,
        commentList: [],
        videos: [],
        videoIndex: 0,
        objectFit: "contain",
        totalCount: '',
        hasmoreData: false,
        loaderMore: true,
        hiddenloading: false,
        inputValue: '',
        addingText: false,
        conid: '',
        lecid: '',
        indexVideo: '',
        rewardNum: '',
        gold: '',
        commnetNum: '',
        nodata: false,
        windowHeight: 0
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        // 滑动
        let that =this
        wsTask = wx.connectSocket({
            url: 'wss://www.gitlay.com'
        })
        wsTask.onOpen(() => {
            console.log('链接成功')
        })


        setInterval(() => {
            let str ='ping,ping'
            wsTask.send({
                data:str,
                success:function () {
                    console.log('ping 发送成功')
                },
                fail:function(res){
                    console.log(res)
                },
                complete:function () {
                    console.log(333333)
                }
            })

        }, 5000)

        wsTask.onMessage((res) => {
            console.log('接收到消息',res)
            if (res.data!='ping'){
                let danmu = {
                    text:res.data,
                    color:'#ff00ff'
                }
                that.vvideo.sendDanmu(danmu)
            }
        })

        this.getVideos()

        // this.getOwnInfo()

        this.videoChange = throttle(this.touchEndHandler, 200)
        console.log(this.videoChange, 'this.videoChangethis.videoChange')
        // 绑定updateVideoIndex事件，更新当前播放视频index
        event.on('updateVideoIndex', this, function (index) {
            console.log('event updateVideoIndex:', index)

            if (index == this.data.videos.length - 1) { //当滑动到最后一条加载下一条数据
                this.setData({
                    nowPage: parseInt(this.data.nowPage + 1)
                })
                this.getVideos()
            }
            setTimeout(() => {
                this.setData({
                    animationShow: false,
                    playState: true
                }, () => {
                    // 切换src后，video不能立即播放，settimeout一下
                    setTimeout(() => {
                        this.vvideo.play()
                    }, 100)
                })
            }, 600)
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this
        wx.getStorage({
            key: 'tag',
            success: function (res) {

                that.setData({
                    tagIdList: res.data
                })
                console.log(that.data.tagIdList)
            }
        })
        // const windowHeight = wx.getSystemInfoSync().windowHeight
        that.setData({
            windowHeight: wx.getSystemInfoSync().windowHeight
        })
    },
    /**
     * 获取视频数据
     */
    getVideos: function () {  // 获取视频列表

        var that = this;
        const params = {
            //   accessToken: app.globalData.token,
            nowPage: that.data.nowPage,
            pageSize: '9'
        }
        Http.HttpRequst(false, '', false, '', params, 'get', false, function (res) {
            // that.setData({
            //   videos: res.dataObject.list
            // })

            if (res.code == 200) {
                if (res.result.length < that.data.rows) {

                    that.setData({
                        videos: that.data.videos.concat(res.result),
                    })
                } else {
                    that.setData({
                        videos: that.data.videos.concat(res.result),
                    })
                    console.log(that.data.videos)
                }
            } else if (res.code == 1001) {

            }
        })
    },
    bindplay() {
        console.log('--- video play ---')
    },
    binderror(err) {
        console.log(err)
    },
    bindtimeupdate(e) {
        let percent = (e.detail.currentTime / e.detail.duration) * 100
        this.setData({
            percent: percent.toFixed(2)
        })
        this.currentTime = e.detail.currentTime
    },
    onReady: function () {
        this.vvideo = wx.createVideoContext("kdvideo", this)
        this.animation = wx.createAnimation({
            duration: 500,// 整个动画过程花费的时间，单位为毫秒
            transformOrigin: '0 0 0'// 动画的类型
        })
        this.toast = this.selectComponent("#toast");
        this.animationTwo = wx.createAnimation({ //评论组件弹出动画
            duration: 400, // 整个动画过程花费的时间，单位为毫秒
            timingFunction: "ease", // 动画的类型
            delay: 0 // 动画延迟参数
        })
    },
    changePlayStatus() {
        console.log('changePlayStatus')
        let playState = !this.data.playState
        if (this.data.animationShow) {

        } else {
            if (playState) {
                this.vvideo.play()
            } else {
                this.vvideo.pause()
            }
            this.setData({
                playState: playState
            })
        }

    },
    touchStart(e) {
        let touchStartingY = this.data.touchStartingY
        this.touchStartTime = e.timeStamp
        touchStartingY = e.touches[0].clientY
        console.log(touchStartingY)
        this.setData({
            touchStartingY: touchStartingY
        })
    },
    touchMove(e) {
        this.videoChange(e)
    },
    touchEndHandler(e) {
        let touchStartingY = this.data.touchStartingY
        console.log(touchStartingY)
        console.log(e.changedTouches[0].clientY)
        let deltaY = e.changedTouches[0].clientY - touchStartingY
        console.log('deltaY ', deltaY)

        let index = this.data.videoIndex

       // wsTask.close( console.log('关闭 WebSocket 连接。'))

        if (deltaY > 100 && index !== 0) {
            // 更早地设置 animationShow
            this.setData({
                animationShow: true
            }, () => {
                console.log('-1 切换')
                this.data.commentList = [] //滑动上一个视频清除评论列表
                this.createAnimation(-1, index).then((res) => {
                    console.log(res)
                    this.setData({
                        animation: this.animation.export(),
                        videoIndex: res.index,
                        currentTranslateY: res.currentTranslateY,
                        percent: 1
                    }, () => {
                        event.emit('updateVideoIndex', res.index)
                    })
                })
            })
        } else if (deltaY < -100 && index !== (this.data.videos.length - 1)) {
            this.setData({
                animationShow: true
            }, () => {
                console.log('+1 切换')
                console.log(index)
                this.data.commentList = [] //滑动下一个视频清除评论列表
                this.createAnimation(1, index).then((res) => {
                    this.setData({
                        animation: this.animation.export(),
                        videoIndex: res.index,
                        currentTranslateY: res.currentTranslateY,
                        percent: 1
                    }, () => {
                        event.emit('updateVideoIndex', res.index)
                    })
                })
            })
        }
    },
    touchEnd(e) {
        console.log('------touchEnd------')
        console.log(e)
        this.touchEndTime = e.timeStamp
        this.videoChange(e)
    },
    touchCancel(e) {
        console.log('------touchCancel------')
        console.log(e)
    },
    listenerLogin: function () {
        // this.toast.showToast('恭喜你，获得了toast');
    },
    createAnimation(direction, index) {
        // direction为-1，向上滑动，animationImage1为(index)的poster，animationImage2为(index+1)的poster
        // direction为1，向下滑动，animationImage1为(index-1)的poster，animationImage2为(index)的poster
        let videos = this.data.videos
        let currentTranslateY = this.data.currentTranslateY
        console.log('direction ', direction)
        console.log('index ', index)
        // 更新 videoIndex
        index += direction
        currentTranslateY += -direction * this.data.windowHeight
        console.log('currentTranslateY: ', currentTranslateY)
        this.animation.translateY(currentTranslateY).step()

        return Promise.resolve({
            index: index,
            currentTranslateY: currentTranslateY
        })
    },
    showTalks: function (e) {
        // 加载数据'
        this.setData({
            contentId: e.currentTarget.dataset.videoid,
            commnetNum: e.currentTarget.dataset.commnetnum
        })
        console.log(e)
        this.getCommentList();

        // 设置动画内容为：使用绝对定位显示区域，高度变为100%
        this.animationTwo.bottom("0rpx").height("100%").step()
        this.setData({
            talksAnimationData: this.animationTwo.export(),
            animationShow: true
        })
    },

    hideTalks: function () {
        // 设置动画内容为：使用绝对定位隐藏整个区域，高度变为0
        this.animationTwo.bottom("-100%").height("0rpx").step()
        this.setData({
            commentList: [],
            talksAnimationData: this.animationTwo.export(),
            animationShow: false,
        })
        this.vvideo.play()
    },
    onScrollLoad: function () {
        // 加载新的数据
        // this.getCommentList();
        // wx.hideNavigationBarLoading();
        console.log('触底了');
        var that = this
        if (that.data.loaderMore) {
            that.setData({
                hasmoreData: false,
                hiddenloading: true,
            })
            setTimeout(function () {
                that.setData({
                    page: parseInt(that.data.nowPage + 1)
                })
                that.getCommentList()
            }, 500)
        }
    },
    /// 双击
    doubleTap: function (e) {

        var that = this
        // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
        that.setData({
            contentId: e.currentTarget.dataset.videoid, // 点赞内容id
            videoIndex: e.currentTarget.dataset.index,
            likeNum: e.currentTarget.dataset.likenum
        })
        that.addVideoLike(e)
    },
    addVideoLike: function () { // 点赞视频
        var that = this;


        const params = {
            accessToken: app.globalData.token,
            evaType: 'content',
            id: that.data.contentId,
            likeFlag: 1
        }

        const index = that.data.videoIndex
        const videosList = "videos[" + index + "].isLike"
        const likenum = "videos[" + index + "].likenum"
        const like = that.data.likeNum


      //  that.data.videos[index].love=1;

        Http.HttpRequst(false, 'index/addUserLike?id=' + params.id, false, '', params, 'POST', false, function (res) {

            if (res.code == 200) {
                that.setData({
                    [videosList]: res.result,
                    [likenum]: parseInt(like) + parseInt(1)
                })
            } else if (res.code == 101) {
                console.log(res.value)
            } else {

            }
        })
    },
    /**
     * 获取视频评论数据
     */
    getCommentList: function (e) { //
        wx.showNavigationBarLoading();
        const params = {
            pageSize: 10,
            nowPage: this.data.pageNo,
            contId: this.data.contentId,
            accessToken: app.globalData.token
        }
        const that = this
        Http.HttpRequst(false, '/index/getCommentList', false, '', params, 'get', false, function (res) {
            console.log(res.code == 200, '66')
            if (res.code == 200) {
                if (res.result.length < that.data.rows) {
                    that.setData({
                        commentList: that.data.commentList.concat(res.result),
                        totalCount: res.msg
                    })
                    that.setData({
                        hasmoreData: true,
                        hiddenloading: false,
                        loaderMore: false
                    })
                } else {
                    that.setData({
                        commentList: that.data.commentList.concat(res.result),
                        totalCount: res.msg
                    })
                }
                if (that.data.pageNo && res.result.length == 0) {
                    that.setData({
                        nodata: true
                    })
                }
            } else if (res.code == 1001) {

            }
        })
    },
    /**
     * 获取用户信息
     */
    getOwnInfo: function () {
        var params = {
            accessToken: app.globalData.token
        }
        Http.HttpRequst(false, '/api/getOwnInfo', false, '', params, 'get', false, function (res) {
            if (res.code == 102) {
                app.globalData.userId = res.dataObject.lecturerId
            } else if (res.code == 1001) {

            }
        })
    },
    goHome: function () {
        wx.redirectTo({
            url: '/pages/home/home'
        })
    },
    goFollow: function () {
        wx.redirectTo({
            url: '/pages/follow/follow'
        })
    },
    goSearch: function () {
        wx.redirectTo({
            url: '/pages/search/search'
        })
    },
    goUserHome: function (e) {
        var lecrid = e.currentTarget.dataset.lecturerid
        app.globalData.userId = lecrid
        wx.navigateTo({
            url: '/pages/home/home'
        })
    },
    contentInput: function (e) {
        this.setData({
            inputValue: e.detail.value
        })
    },


    /**
     * 点击评论视频
     */
    addComment: function () {

        var that = this
        if (that.data.inputValue == '') {
            // wx.showToast({
            //   title: '内容不能为空',
            //   icon: 'success',
            //   duration: 2000
            // })
            return false
        }





        //websocket 发送
        var param = that.data.contentId+','+that.data.inputValue
        wsTask.send({
            data:param,
            success:function () {
                let danmu = {
                    text:that.data.inputValue,
                    color:'#ff00ff'
                }
                that.vvideo.sendDanmu(danmu)
                console.log('websocket 发送成功')
            },
            fail:function(res){
                console.log(res)
            },
            complete:function () {
                console.log(333333)
            }
        })

        var params = {
            contentId: that.data.contentId,
            cont: that.data.inputValue,
            videoTime:this.currentTime
        }

        Http.HttpRequst(false, 'index/addComment', false, '', params, 'POST', false, function (res) {
            if (res.code == 200) {
                // that.setData({
                //   commentList: res.
                // })
                that.setData({
                    inputValue: '',
                    commentList: []
                })
                const commnetnum = "videos[" + that.data.videoIndex + "].commnetnum"
                console.log(that.data.commnetNum)
                that.setData({
                    [commnetnum]: parseInt(that.data.commnetNum) + parseInt(1)
                })

                that.getCommentList()
                console.log('评论成功')
            } else if (res.code == 1001) {

            }
        })





    },

    /**
     * 点击头像关注
     */
    addLecturerFans: function (e) {
        const that = this
        const lecrId = e.currentTarget.dataset.lecturerid
        const index = e.currentTarget.dataset.index
        const isfans = "videos[" + index + "].isfans"
        Http.HttpRequst(false, '/api/lecture/addLecturerFans?accessToken=' + app.globalData.token + '&lecrId=' + lecrId, false, '', '', 'POST', false, function (res) {
            if (res.code == 102) {
                that.setData({
                    [isfans]: 1
                })
            } else if (res.code == 1001) {

            }
        })
    },
    //粉丝取消关注
    delLecturerFans: function (e) {
        const that = this
        console.log(e)
        const lecrId = e.currentTarget.dataset.lecturerid
        const index = e.currentTarget.dataset.index
        const isfans = "videos[" + index + "].isfans"
        Http.HttpRequst(false, '/api/lecture/delLecturerFans?accessToken=' + app.globalData.token + '&lecrId=' + lecrId, false, '', '', 'POST', false, function (res) {
            if (res.code == 102) {
                that.setData({
                    [isfans]: 0
                })
            } else if (res.code == 1001) {

            }
        })
    },
    /**
     * 悬赏弹框组件
     */
    onShowModal: function (e) {
        // 显示弹框
        console.log(e)
        console.log(111111)
        this.setData({
            addingText: true,
            conid: e.currentTarget.dataset.conid,
            lecid: e.currentTarget.dataset.lecid,
            indexVideo: e.currentTarget.dataset.index,
            rewardNum: e.currentTarget.dataset.rewardnum
        })
    },
    onInputCancel: function () {
        // 隐藏弹框
        console.log(55566)
        this.setData({
            addingText: false
        })
    },

    onInputConfirm: function (e) { //赠送金币
        // 隐藏弹框
        console.log(e)
        // this.toast.showToast('请选择要打赏的金币数目');
        const that = this
        const params = {
            accessToken: app.globalData.token,
            count: e.detail,
            conid: that.data.conid,
            lecid: that.data.lecid
        }

        // if (that.data.gold < 5) {
        //   that.toast.showToast('金币不足');
        //   return false
        // }

        // if (e.detail == '') {
        //   that.toast.showToast('请选择要打赏的金币数目');
        //   return false
        // }
        const rewardNum = "videos[" + that.data.indexVideo + "].rewardNum"
        // wx.showModal({
        //   title: '提示',
        //   content: '确定要打赏' + e.detail + '金币吗?',
        //   confirmText: "确认",
        //   cancelText: "取消",
        //   success: function (res) {
        //     console.log(res);
        //     if (res.confirm) {
        //       Http.HttpRequst(false, '/api/lecture/reward?accessToken=' + params.accessToken + '&conid=' + params.conid + '&lecid=' + params.lecid + '&count=' + params.count, false, '', '', 'POST', false, function (res) {
        //         console.log(res.code == 102, '66')
        //         if (res.code == 102) {
        //           that.setData({
        //             [rewardNum]: parseInt(1) + parseInt(that.data.rewardNum),
        //             addingText: false
        //           })
        //           wx.showToast({
        //             title: '打赏成功！',
        //             icon: 'success',
        //             duration: 2000
        //           });
        //           // that.countdown = that.selectComponent('#modalShow');
        //           // that.countdown.hideInputBox();
        //           that.getUser()
        //         } else if (res.code == 101) {

        //         } else {

        //         }
        //       })
        //     } else {
        //       console.log('用户点击辅助操作')
        //     }
        //   }
        // });
    },
    goAddVideo: function () {
        wx.removeStorage({
            key: 'tag'
        })
        wx.navigateTo({
            url: '/pages/uploader/uploader'
        })
    }
})

function throttle(fn, delay) {
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    }
}