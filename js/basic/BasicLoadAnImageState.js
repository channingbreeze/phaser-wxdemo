import Phaser from '../libs/phaser-wx.js';

export default class BasicLoadAnImageState extends Phaser.State {
	
	constructor(game) {
		super();
		this.game = game;
	}

	preload() {
		// 加载一个图片，之后可通过 einstein 来引用
    this.game.load.image('einstein', 'assets/basic/ra_einstein.jpg');
	}

	create() {
		// 在(0,0)位置显示该图片
    this.game.add.sprite(0, 0, 'einstein');

    // tap屏幕的时候，回到menu
    this.game.input.onTap.add(this.onTap, this);
	}

	onTap() {
		this.game.state.start('menu');
	}

}
