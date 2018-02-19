import Phaser from '../libs/phaser-wx.js';

export default class PreloadState extends Phaser.State {
  
  constructor(game) {
    super();
    this.game = game;
  }

  preload() {
    this.game.load.image('arrowBack', 'assets/arrow_left.png');
    this.game.load.image('arrowLeft', 'assets/arrow-l.png');
    this.game.load.image('arrowRight', 'assets/arrow-r.png');
    this.game.load.image('arrowUp', 'assets/arrow-u.png');
    this.game.load.image('arrowDown', 'assets/arrow-d.png');
  }

  create() {
    this.game.state.start('animation');
  }

}
