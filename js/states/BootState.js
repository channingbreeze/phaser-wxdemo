import Phaser from '../libs/phaser-wx.js';

export default class BootState extends Phaser.State {
	
	constructor(game) {
		super();
		this.game = game;
	}

	create() {
		// this is very important
		this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

		// invalid sound lock
		this.game.sound.touchLocked = false;
		
		this.game.state.start('preload');
	}

}
