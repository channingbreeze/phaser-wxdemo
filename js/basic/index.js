import Phaser from '../libs/phaser-wx.js';

import BasicLoadAnImageState from './BasicLoadAnImageState.js'
import BasicClickOnAnImageState from './BasicClickOnAnImageState.js'
import BasicMoveAnImageState from './BasicMoveAnImageState.js'
import BasicImageFollowInputState from './BasicImageFollowInputState.js'
import BasicLoadAnAnimationState from './BasicLoadAnAnimationState.js'
import BasicRenderTextState from './BasicRenderTextState.js'
import BasicTweenAnImageState from './BasicTweenAnImageState.js'

export default class BasicExamples {
  
  constructor(game) {
    
    game.state.add('basicLoadAnImage', new BasicLoadAnImageState(game));
    game.state.add('basicClickOnAnImageState', new BasicClickOnAnImageState(game));
    game.state.add('basicMoveAnImageState', new BasicMoveAnImageState(game));
    game.state.add('basicImageFollowInputState', new BasicImageFollowInputState(game));
    game.state.add('basicLoadAnAnimationState', new BasicLoadAnAnimationState(game));
    game.state.add('basicRenderTextState', new BasicRenderTextState(game));
    game.state.add('basicTweenAnImageState', new BasicTweenAnImageState(game));

  }

}
