import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class basicImageFollowInputState extends BackToSubMenuState {
  
  constructor(game) {
    super();
    this.game = game;
  }

  init(key) {
    super.init(key);
  }

  preload() {
    this.game.load.image('phaser', 'assets/basic/phaser.png');
  }

  create() {
    super.create();
    
    this.sprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'phaser');
    this.sprite.anchor.set(0.5);

    // 精灵启动物理引擎，这样才会有body属性
    this.game.physics.arcade.enable(this.sprite);
  }

  update() {
    // 如果鼠标距离和精灵距离大于8
    if (this.game.physics.arcade.distanceToPointer(this.sprite, this.game.input.activePointer) > 8) {
      // 让精灵以300的速度靠近鼠标(或者Touch)
      this.game.physics.arcade.moveToPointer(this.sprite, 300);
    } else {
      // 精灵速度设为0
      this.sprite.body.velocity.set(0);
    }
  }

  render() {
    // 在(32,32)的地方打印输入的调试信息
    this.game.debug.inputInfo(32, 32);
  }

}
