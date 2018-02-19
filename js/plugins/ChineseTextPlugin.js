import Phaser from '../libs/phaser-wx.js';

Phaser.Plugin.ChineseTextPlugin = function(game, parent) {
  Phaser.Plugin.call(this, game, parent);
}

Phaser.Plugin.ChineseTextPlugin.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.ChineseTextPlugin.prototype.constructor = Phaser.Plugin.ChineseTextPlugin;

Phaser.Plugin.ChineseTextPlugin.prototype.forceWrap = function(x, y, str, style) {
  
  var newStr = "";
  
  if(style.wordWrap && style.wordWrapWidth) {
    var tmp = this.game.add.text(x, y, str, style);
    
    var ratio = tmp.width / style.wordWrapWidth;
    var i = 0, j = 0;
    while(i < str.length) {
      tmp.text = str.substring(j, i);
      if(tmp.width > style.wordWrapWidth) {
        newStr += str.substring(j, i - 1);
        newStr += " ";
        j = i - 1;
        i = j;
      } else {
        i = i + 1;
      }
    }
    newStr += str.substring(j, str.length);
    tmp.destroy();
  } else {
    newStr = str;
  }
  
  var text = this.game.add.text(x, y, newStr, style);
  return text;
  
}

export default Phaser.Plugin.ChineseTextPlugin;

