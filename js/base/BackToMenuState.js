import Phaser from '../libs/phaser-wx.js';
import Arrow from '../objects/Arrow.js';

export default class BackToMenuState extends Phaser.State {
  
  constructor(game) {
    super();
    this.game = game;
  }

  create() {
    this.arrowBack = new Arrow(this.game, 26, 26, 'arrowBack');
    this.arrowBack.addClick(this.backToMenu, this);
  }

  backToMenu() {
    this.game.state.start('menu');
  }

}
