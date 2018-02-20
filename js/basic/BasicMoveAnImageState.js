import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class BasicMoveAnImageState extends BackToSubMenuState {
  
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
    
    var sprite = this.game.add.sprite(0, 0, 'einstein');
    // 精灵启动物理引擎
    this.game.physics.enable(sprite, Phaser.Physics.ARCADE);
    // 设置水平速度150
    sprite.body.velocity.x = 150;
  }

}
