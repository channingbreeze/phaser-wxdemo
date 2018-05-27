import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class OpenShowRankingListState extends BackToSubMenuState {
  
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

    this.openDataContext = wx.getOpenDataContext();
    this.sharedCanvas = this.openDataContext.canvas;
    
    var text = "show ranking list";
    // 文字样式
    var style = { font: "32px Arial", fill: "#ff0044", align: "center" };
    // 显示文字
    this.t = this.game.add.text(this.game.world.centerX - 160, 300, text, style);
    // 开启输入
    this.t.inputEnabled = true;
    // 文字点击时回调listener，上下文为this
    this.t.events.onInputDown.add(this.listener, this);

  }

  update() {
    if(this.game.renderType === Phaser.HEADLESS) {

      wx.originContext.drawImage(this.sharedCanvas, 0, 0, 375, 667)
    }
  }

  listener() {
    
    var openDataContext = wx.getOpenDataContext();
    var sharedCanvas = openDataContext.canvas;

    var openCanvas = this.game.add.sprite(0, 100, Phaser.XTexture(sharedCanvas, 0, 0, 375, 667));

    this.openDataContext.postMessage({
      action: 'SHOW_RANKING_LIST'
    });

  }

}
