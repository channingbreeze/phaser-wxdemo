import Phaser from 'libs/phaser-wx.js'
import BootState from 'states/BootState.js'
import PreloadState from 'states/PreloadState.js'
import GameState from 'states/GameState.js'

var game = new Phaser.Game({
  width: 375,
  height: 667,
  renderer: Phaser.CANVAS,
  canvas: canvas
});

game.state.add('boot', new BootState(game));
game.state.add('preload', new PreloadState(game));
game.state.add('game', new GameState(game));
game.state.start('boot');
