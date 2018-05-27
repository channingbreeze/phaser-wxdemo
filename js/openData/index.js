let sharedCanvas = wx.getSharedCanvas()
let context = sharedCanvas.getContext('2d')
context.fillStyle = 'red'
context.fillRect(0, 0, 375, 667)

wx.onMessage(data => {
  console.log(data);
  if(data.action === "GET_SCORE") {
    wx.getUserCloudStorage({
      keyList: ["score"],
      success: function(obj) {
        if(obj.KVDataList) {
          for(var i=0; i<obj.KVDataList.length; i++) {
            console.log('get ' + obj.KVDataList[i].key + ' : ' + obj.KVDataList[i].value);
          }
        } else {
          console.log('KVDataList null');
        }
      },
      fail: function() {
        console.log('get data fail');
      },
      complete: function() {
        console.log('get data complete');
      }
    });
  } else if(data.action === "GET_FRIEND_SCORE") {
    wx.getFriendCloudStorage({
      keyList: ["score"],
      success: function(obj) {
        console.log(obj)
        if(obj.data) {
          for(var i=0; i<obj.data.length; i++) {
            console.log('get ' + obj.data[i].nickname + ' : ' + obj.data[i].avatarUrl);
            if(obj.data[i].KVDataList) {
              for(var j=0; j<obj.data[i].KVDataList.length; j++) {
                console.log('get ' + obj.data[i].KVDataList[j].key + ' : ' + obj.data[i].KVDataList[j].value);
              }
            }
          }
        } else {
          console.log('KVDataList null');
        }
      },
      fail: function() {
        console.log('get friend data fail');
      },
      complete: function() {
        console.log('get friend data complete');
      }
    })
    /**
     * 排行榜渲染方案来自网友aleafworld，详细请看他的帖子：http://club.phaser-china.com/topic/5af6bf52484a53dd723f42e1
     */
  } else if(data.action === "SHOW_RANKING_LIST") {
    wx.getFriendCloudStorage({
      keyList: ["score"],
      success: function(obj) {
        console.log(obj)
        if(obj.data) {
          for(var i=0; i<obj.data.length; i++) {
            console.log('get ' + obj.data[i].nickname + ' : ' + obj.data[i].avatarUrl);
            if(obj.data[i].KVDataList) {
              for(var j=0; j<obj.data[i].KVDataList.length; j++) {
                console.log('get ' + obj.data[i].KVDataList[j].key + ' : ' + obj.data[i].KVDataList[j].value);
              }

              console.log('start show ranking list');
              context.clearRect(0, 0, 375, 667);
              context.fillStyle = "rgba(64, 64, 64, 0.5)";
              context.fillRect(0, 0, 375, 667);

              for (var i=0; i<obj.data.length; i++) {

                context.fillStyle = "rgba(255,255,255,0.1)";
                context.fillRect(5, i*35 + 5, 190, 30);

                // 头像
                var avatar = wx.createImage();
                avatar.src = obj.data[i].avatarUrl;
                avatar.onload = (function(c,a,i){
                  return function(){
                    // console.log("drawing : " + i);
                    c.drawImage(a, 30, i*35+8, 24, 24);
                  };
                })(context,avatar,i); // 这里是异步执行，要做个闭包处理

                context.fillStyle = "rgb(250, 250, 250)";
                context.font = "12px Arial";
                context.textAlign = "left";
                context.textBaseline = "top";
                context.fillText(i+1, 10, i*35 + 12); // 名次
                context.fillText(obj.data[i].nickname, 60, i*35 + 12); // 昵称
                context.textAlign = "right";
                context.fillText(obj.data[i].KVDataList[0].value, 185, i*35 + 12); // 分数

              }

              console.log('show ranking list complete');
            }
          }
        } else {
          console.log('KVDataList null');
        }
      },
      fail: function() {
        console.log('get friend data fail');
      },
      complete: function() {
        console.log('get friend data complete');
      }
    })
  }
});
