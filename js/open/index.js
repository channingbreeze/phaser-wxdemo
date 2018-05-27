import PIXI from '../libs/pixi-wx.js';
import Phaser from '../libs/phaser-wx.js';

import OpenShowOpenCanvasState from './OpenShowOpenCanvasState.js'
import OpenGetCloudScoreState from './OpenGetCloudScoreState.js'
import OpenGetFriendCloudScoreState from './OpenGetFriendCloudScoreState.js'
import OpenSetCloudScoreState from './OpenSetCloudScoreState.js'
import OpenShowRankingListState from './OpenShowRankingListState.js'

export default class OpenExamples {
  
  constructor(game) {
    
    Phaser.XTexture = function(xCanvas, x, y, w, h){
      return new PIXI.Texture(new PIXI.BaseTexture(xCanvas), new PIXI.Rectangle(x, y, w, h));
    };

    game.state.add('openShowOpenCanvas', new OpenShowOpenCanvasState(game));
    game.state.add('openGetCloudScore', new OpenGetCloudScoreState(game));
    game.state.add('openGetFriendCloudScore', new OpenGetFriendCloudScoreState(game));
    game.state.add('openSetCloudScore', new OpenSetCloudScoreState(game));
    game.state.add('openShowRankingList', new OpenShowRankingListState(game));

  }

}
