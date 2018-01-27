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
      console.log(j, i, tmp.width);
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
    console.log(newStr);
    tmp.destroy();
  } else {
    newStr = str;
  }
  
  var text = this.game.add.text(x, y, newStr, style);
  return text;
  
}
