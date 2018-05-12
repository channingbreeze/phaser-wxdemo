import Phaser from '../libs/phaser-wx.js';

import OpenShowOpenCanvasState from './OpenShowOpenCanvasState.js'
import OpenGetCloudScoreState from './OpenGetCloudScoreState.js'
import OpenGetFriendCloudScoreState from './OpenGetFriendCloudScoreState.js'
import OpenSetCloudScoreState from './OpenSetCloudScoreState.js'

export default class OpenExamples {
  
  constructor(game) {
    
    game.state.add('openShowOpenCanvas', new OpenShowOpenCanvasState(game));
    game.state.add('openGetCloudScore', new OpenGetCloudScoreState(game));
    game.state.add('openGetFriendCloudScore', new OpenGetFriendCloudScoreState(game));
    game.state.add('openSetCloudScore', new OpenSetCloudScoreState(game));

  }

}
