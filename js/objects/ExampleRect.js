import Phaser from '../libs/phaser-wx.js';

export default class ExampleRect extends Phaser.Sprite {
  
  constructor(game, x, y, properties) {
    
    var bmd = game.add.bitmapData(100, 100);

    bmd.ctx.beginPath();
    bmd.ctx.arc(50, 50, 50, 0, Math.PI * 2);
    var radialGradient = bmd.ctx.createRadialGradient(50, 50, 40, 50, 50, 50);
    radialGradient.addColorStop(0, '#43d4d9');
    radialGradient.addColorStop(1, '#4851ff');
    bmd.ctx.fillStyle = radialGradient;
    bmd.ctx.fill();

    super(game, x, y, bmd);
    this.game = game;

    this.anchor.setTo(0.5, 0.5);

    var style = { font: "32px Arial", fill: "#000", align: "center" };
    var text = this.game.make.text(0, 0, properties.name, style);
    text.anchor.setTo(0.5, 0.5);
    this.addChild(text);

    this.events.onInputDown.add(this.onDown, this);
    this.events.onInputUp.add(this.onUp, this);

  }

  onDown() {
    this.scale.setTo(1.3, 1.3);
  }

  onUp() {
    this.scale.setTo(1, 1);
  }

  
  addClick(clickFn, context) {

    this.events.onInputUp.add(clickFn, context);

  }


}
