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
  }
});
