import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class OpenShowOpenCanvasState extends BackToSubMenuState {
  
  constructor(game) {
    super();
    this.game = game;
  }

  init(key) {
    super.init(key);
  }

  preload() {
    // 加载一个图片，之后可通过 einstein 来引用
    this.game.load.image('einstein', 'assets/basic/ra_einstein.jpg');
  }

  create() {
    super.create();
    
    var text = "open canvas";
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
    var tmpText = this.game.add.text(0, 0, " ");
    tmpText.reset(0, 0);
    this.game.time.events.add(Phaser.Timer.SECOND * 0.1, function() {
      this.game.renderType = Phaser.HEADLESS;
      var openDataContext = wx.getOpenDataContext();
      var sharedCanvas = openDataContext.canvas;
      wx.originContext.drawImage(sharedCanvas, 0, 0, 375, 667)
    }, this);
    
  }

}
