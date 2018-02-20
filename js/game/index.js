import Phaser from '../libs/phaser-wx.js';

import PlanePreloadState from './plane/states/PlanePreloadState.js'
import PlaneGameState from './plane/states/PlaneGameState.js'

export default class GameExamples {
  
  constructor(game) {
    
    game.state.add('planePreload', new PlanePreloadState(game));
    game.state.add('planeGame', new PlaneGameState(game));

  }

}
