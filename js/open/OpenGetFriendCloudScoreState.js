import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class OpenGetFriendCloudScoreState extends BackToSubMenuState {
  
  constructor(game) {
    super();
    this.game = game;
  }

  init(key) {
    super.init(key);
  }

  preload() {
  }

  create() {
    super.create();
    
    var text = "get friend score";
    // 文字样式
    var style = { font: "32px Arial", fill: "#ff0044", align: "center" };
    // 显示文字
    this.t = this.game.add.text(this.game.world.centerX - 160, 300, text, style);
    // 开启输入
    this.t.inputEnabled = true;
    // 文字点击时回调listener，上下文为this
    this.t.events.onInputDown.add(this.listener, this);

  }

  listener() {

    let openDataContext = wx.getOpenDataContext()
    openDataContext.postMessage({
      action: 'GET_FRIEND_SCORE'
    })

  }

}
