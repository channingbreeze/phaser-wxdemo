import Phaser from '../../../libs/phaser-wx.js'

export default class GameState extends Phaser.State {

	constructor(game) {
		super();
		this.game = game;
	}

	preload() {

	}

	create() {
		// 开启物理引擎
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.bg = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'bg');
    this.bg.autoScroll(0, 80);

    // 敌机
    this.enemyGroup = this.game.add.group();
    this.enemyGroup.enableBody = true;

    // 子弹
    this.bulletGroup = this.game.add.group();
    this.bulletGroup.enableBody = true;

    // 爆炸
    this.explosionGroup = this.game.add.group();
    this.explosionGroup.enableBody = true;

    // 飞机
    this.hero = this.game.add.sprite(this.game.width / 2, this.game.height - 50, 'hero');
    this.hero.anchor.setTo(0.5, 0.5);
    this.hero.scale.setTo(0.5, 0.5);
    this.hero.inputEnabled = true;
    this.hero.input.enableDrag(true);
    this.game.physics.arcade.enable(this.hero);
    this.hero.body.collideWorldBounds = true;

    // 分数
    var style = {font: "32px", fill: "#ffffff"};
    this.score = 0;
    this.scoreText = this.game.add.text(10, 10, this.score + '', style);

    // 生成敌机
    this.enemyTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 2, function() {
    	this.generateOneEnemy();
    }, this);

    // 发射子弹
    this.bulletTimer = this.game.time.events.loop(Phaser.Timer.SECOND * 0.5, function() {
    	this.shoot();
    }, this);

    // 声音，如果要用循环，需要给定totalDuration的值，音频长度
    this.soundBgm = this.game.add.audio('bgm', 1, {loop: true, totalDuration: 62});
    this.soundBgm.play();

    this.soundBullet = this.game.add.audio('bullet');
    this.soundBoom = this.game.add.audio('boom');

	}

	update() {
		this.game.physics.arcade.overlap(this.hero, this.enemyGroup, this.dead, null, this);
		this.game.physics.arcade.overlap(this.enemyGroup, this.bulletGroup, this.hit, null, this);
	}

	render() {
	}

	randomEnemyX() {
		var halfW = 120 * 0.7;
		return this.game.rnd.integerInRange(halfW, this.game.width - halfW);
	}

	generateOneEnemy() {

		var enemy = this.enemyGroup.getFirstExists(false);
    if(enemy) {
    	enemy.reset(this.randomEnemyX(), 79 * 0.5);
    	enemy.body.velocity.y = 200;
    } else {
    	enemy = this.enemyGroup.create(this.randomEnemyX(), 79 * 0.5, 'enemy');
    	enemy.outOfBoundsKill = true;
    	enemy.checkWorldBounds = true;
    	enemy.anchor.setTo(0.5, 0.5);
    	enemy.scale.setTo(0.7, 0.7);
    	enemy.body.velocity.y = 200;
    }

	}

	shoot() {

		var bullet = this.bulletGroup.getFirstExists(false);
    if(bullet) {
    	bullet.reset(this.hero.x, this.hero.y);
    	bullet.body.velocity.y = -600;
    } else {
    	bullet = this.bulletGroup.create(this.hero.x, this.hero.y, 'bullet');
    	bullet.outOfBoundsKill = true;
    	bullet.checkWorldBounds = true;
    	bullet.anchor.setTo(0.5, 0.5);
    	bullet.scale.setTo(0.4, 0.4);
    	bullet.body.velocity.y = -600;
    }

    this.soundBullet.play();

	}

	dead(hero) {
		this.stopAll();
		this.gameOver();
	}

	hit(enemy, bullet) {
		enemy.kill();
		bullet.kill();

		// 加分
		this.score++;
		this.scoreText.text = this.score + '';

		var explosion = this.explosionGroup.getFirstExists(false);
    if(!explosion) {
    	explosion = this.explosionGroup.create(enemy.x, enemy.y, 'explosion');
    	explosion.anchor.setTo(0.5, 0.5);
    } else {
    	explosion.reset(enemy.x, enemy.y);
    }
    var anim = explosion.animations.add('explosion');
    anim.play('explosion', 20);
    anim.onComplete.add(function() {
    	explosion.kill();
    }, this);

    this.soundBoom.play();
	}

	stopAll() {
		this.enemyGroup.setAll('body.velocity.y', 0);
		this.bulletGroup.setAll('body.velocity.y', 0);
		this.game.time.events.remove(this.enemyTimer);
		this.game.time.events.remove(this.bulletTimer);
		this.bg.stopScroll();
    this.hero.input.disableDrag();
    this.soundBgm.stop();
	}

	gameOver() {
		var dialog = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'common', 'dialog');
		dialog.anchor.setTo(0.5, 0.5);
		dialog.scale.setTo(2.5, 2.5);
		
		// 文字
    var style = {font: "16px", fill: "#ffffff"};
    // 游戏结束
    var gameOverText = this.game.add.text(2, -35, '游戏结束', style);
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(0.7, 0.7);
    dialog.addChild(gameOverText);

    var gameOverScoreText = this.game.add.text(0, -8, '得分: ' + this.score, style);
    gameOverScoreText.anchor.setTo(0.5, 0.5);
    gameOverScoreText.scale.setTo(0.6, 0.6);
    dialog.addChild(gameOverScoreText);

    var restartButton = this.game.add.sprite(0, 16, 'common', 'button');
    restartButton.anchor.setTo(0.5, 0.5);
    restartButton.scale.setTo(1.2, 0.7);
    dialog.addChild(restartButton);

    var restartText = this.game.add.text(0, 2, '返回', style);
    restartText.anchor.setTo(0.5, 0.5);
    restartText.scale.setTo(0.55/1.2, 0.55/0.7);
    restartButton.addChild(restartText);

    restartButton.inputEnabled = true;
    restartButton.events.onInputDown.add(this.restart, this);

	}

	restart() {
		this.game.state.start('menu');
	}

}
