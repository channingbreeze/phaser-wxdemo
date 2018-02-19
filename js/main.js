import Phaser from 'libs/phaser-wx.js'

import BootState from 'states/BootState.js'
import PreloadState from 'states/PreloadState.js'
import AnimationState from 'states/AnimationState.js'
import MenuState from 'states/MenuState.js'
import SubMenuState from 'states/SubMenuState.js'

import BasicLoadAnImageState from 'basic/BasicLoadAnImageState.js'
import BasicClickOnAnImageState from 'basic/BasicClickOnAnImageState.js'

import PlanePreloadState from 'plane/states/PlanePreloadState.js'
import PlaneGameState from 'plane/states/PlaneGameState.js'

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

game.state.add('basicLoadAnImage', new BasicLoadAnImageState(game));
game.state.add('basicClickOnAnImageState', new BasicClickOnAnImageState(game));

game.state.add('planePreload', new PlanePreloadState(game));
game.state.add('planeGame', new PlaneGameState(game));

game.state.start('boot');
