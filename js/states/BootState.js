import Phaser from '../libs/phaser-wx.js';

export default class GameState extends Phaser.State {
	
	constructor(game) {
		super();
		this.game = game;
	}

	create() {
		// this is very important
		this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

		this.game.state.start('preload');
	}

}
