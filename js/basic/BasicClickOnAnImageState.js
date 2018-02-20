import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class BasicClickOnAnImageState extends BackToSubMenuState {
  
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
    
    // 将图片放在游戏区域中心
    this.image = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'einstein');
    // 将图片锚点设置为中心
    this.image.anchor.set(0.5);
    // 允许图片响应输入
    this.image.inputEnabled = true;
    // 创建白色文字
    this.text = this.game.add.text(0, 64, '', { fill: '#ffffff' });
    // 初始化计数器
    this.counter = 0;
    // 图片点击时回调listener，上下文为this
    this.image.events.onInputDown.add(this.listener, this);

  }

  listener () {
    // 计数
    this.counter++;
    // 修改文本
    this.text.text = "You clicked " + this.counter + " times!";
  }

}
