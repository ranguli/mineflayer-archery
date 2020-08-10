const mineflayer = require('mineflayer');
const archery = require('../src')(mineflayer);

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'autototem',
});

bot.loadPlugin(archery);

bot.once('spawn', function() {
  bot.enableArchery()
});
