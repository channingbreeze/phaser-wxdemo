import Phaser from '../libs/phaser-wx.js';
import BackToSubMenuState from '../base/BackToSubMenuState.js';

export default class BasicLoadAnImageState extends BackToSubMenuState {
	
	constructor(game) {
		super();
		this.game = game;
	}

  init(key) {
    super.init(key);
  }

	preload() {
		// 加载一个图片，之后可通过 einstein 来引用
    this.game.load.image('einstein', 'assets/basic/ra_einstein.jpg');
	}

	create() {
    super.create();
    
		// 在(100, 100)位置显示该图片
    this.game.add.sprite(100, 100, 'einstein');
	}

}
