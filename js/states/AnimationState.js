import Phaser from '../libs/phaser-wx.js';

export default class AnimationState extends Phaser.State {
	
	constructor(game) {
		super();
		this.game = game;
	}

	create() {
		console.log('animation')
		this.game.state.start('menu');
	}

}
