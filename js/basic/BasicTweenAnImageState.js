import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class BasicTweenAnImageState extends BackToSubMenuState {
  
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
    
    this.sprite = this.game.add.sprite(0, 0, 'einstein');
    // 添加一个Tween动画
    this.tween = this.game.add.tween(this.sprite);
    // 5秒内线性移动到x为100处
    this.tween.to({ x: 100 }, 5000, 'Linear', true, 0);
  }

}
