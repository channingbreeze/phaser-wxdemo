import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class OpenSetCloudScoreState extends BackToSubMenuState {
  
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
    
    // 随机一个score
    this.score = this.game.rnd.integerInRange(0, 100)

    var text = "set score to " + this.score;
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

    var scoreValue = this.score;

    wx.setUserCloudStorage({
      KVDataList: [{
        key: "score",
        value: scoreValue + ""
      }],
      success: function() {
        console.log('save score ' + scoreValue + ' success');
      },
      fail: function() {
        console.log('save score ' + scoreValue + ' fail');
      },
      complete: function() {
        console.log('save score ' + scoreValue + ' complete');
      }
    });
  }

}
