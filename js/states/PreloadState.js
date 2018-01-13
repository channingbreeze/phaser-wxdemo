import Phaser from '../libs/phaser-wx.js'
import Common from '../atlas/common.js'

export default class GameState extends Phaser.State {

	constructor(game) {
		super();
		this.game = game;
	}

	preload() {
		this.game.load.image('bg', 'images/bg.jpg');
		this.game.load.image('hero', 'images/hero.png');
		this.game.load.image('enemy', 'images/enemy.png');
		this.game.load.spritesheet('explosion', 'images/explosion.png', 47, 64, 19);
		this.game.load.image('bullet', 'images/bullet.png');
		this.game.load.atlas('common', 'images/common.png', null, Common);
	}

	create() {
		this.game.state.start('game');
	}

}
