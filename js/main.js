import Phaser from 'libs/phaser-wx.js'

import BootState from 'states/BootState.js'
import PreloadState from 'states/PreloadState.js'
import AnimationState from 'states/AnimationState.js'
import MenuState from 'states/MenuState.js'
import SubMenuState from 'states/SubMenuState.js'

import BasicExamples from 'basic/index.js';
import GameExamples from 'game/index.js';

var game = new Phaser.Game({
  width: 375,
  height: 667,
  renderer: Phaser.CANVAS,
  canvas: canvas
});

game.state.add('boot', new BootState(game));
game.state.add('preload', new PreloadState(game));
game.state.add('animation', new AnimationState(game));
game.state.add('menu', new MenuState(game));
game.state.add('submenu', new SubMenuState(game));

new BasicExamples(game);
new GameExamples(game);

game.state.start('boot');
