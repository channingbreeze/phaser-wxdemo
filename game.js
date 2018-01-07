import './js/libs/weapp-adapter'
import Phaser from './js/libs/phaser-wx.js'

var game = new Phaser.Game({
  width: 375,
  height: 667,
  renderer: Phaser.CANVAS,
  canvas: canvas
});

var state = function() {
	this.create = function() {
		game.stage.backgroundColor = '#B4B4B4';

		var style = { font: "30px Arial", fill: "#ff0044", align: "center" };
    var text = game.add.text(game.world.centerX, game.world.centerY, "Hello Phaser-WX", style);
    text.anchor.set(0.5);
	}
}

game.state.add('state', state);
game.state.start('state');
