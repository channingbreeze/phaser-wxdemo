import Phaser from '../libs/phaser-wx.js';
import Examples from '../config/Examples.js';

export default class MenuState extends Phaser.State {
	
	constructor(game) {
		super();
		this.game = game;
	}

	create() {
		this.game.stage.backgroundColor = '#B4B4B4';

		var style = { font: "30px Arial", fill: "#ff0044", align: "center" };

		var i = 0;
		for(var key in Examples) {
			for(var index in Examples[key]) {
				i++;
				var text = this.game.add.text(this.game.world.centerX, i * 30, Examples[key][index].name, style);
	    	text.anchor.set(0.5);

	    	text.inputEnabled = true;
				text.events.onInputDown.add(this.clickText, {state: this, example: Examples[key][index]});
			}
		}
		
	}

	clickText() {
		var state = this.state;
		var example = this.example;
		state.game.state.start(example.state);
	}

}
