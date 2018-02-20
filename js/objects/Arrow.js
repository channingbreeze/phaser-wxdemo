import Phaser from '../libs/phaser-wx.js';

export default class Arrow extends Phaser.Sprite {
  
  constructor(game, x, y, texture) {
    
    super(game, x, y, texture);
    this.game = game;
    this.game.world.add(this);

    this.anchor.setTo(0.5, 0.5);

    this.inputEnabled = true;

    this.events.onInputDown.add(this.onDown, this);
    this.events.onInputUp.add(this.onUp, this);

  }

  onDown() {
    this.scale.setTo(1.5, 1.5);
  }

  onUp() {
    this.scale.setTo(1, 1);
  }

  addClick(clickFn, context) {

    this.events.onInputUp.add(clickFn, context);

  }

  showAndHide(show) {
    if(show) {
      this.inputEnabled = true;
      this.alpha = 1;
    } else {
      this.inputEnabled = false;
      this.alpha = 0;
    }
  }

}
