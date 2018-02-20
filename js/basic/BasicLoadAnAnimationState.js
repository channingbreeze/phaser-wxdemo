import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';
import runningBotAtlas from '../../assets/basic/running_bot.js';

export default class BasicLoadAnAnimationState extends BackToSubMenuState {
  
  constructor(game) {
    super();
    this.game = game;
  }

  init(key) {
    super.init(key);
  }

  preload() {
    // 加载图集
    this.game.load.atlasJSONHash('bot', 'assets/basic/running_bot.png', null, runningBotAtlas);
  }

  create() {
    super.create();
    
    // 同样的方法创建精灵
    this.bot = this.game.add.sprite(200, 200, 'bot');
    // 添加一个动画，叫做run
    this.bot.animations.add('run');
    // 进行动画，每秒15帧，循环播放
    this.bot.animations.play('run', 15, true);
  }

}
