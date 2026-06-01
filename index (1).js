const mineflayer = require('mineflayer');

// ===== CONFIG =====
const HOST         = 'your-server.aternos.me';  // change this
const PORT         = 62548;                       // change this
const USERNAME     = 'YourBotName';               // change this
const VERSION      = '1.16.5';                    // change this
const PASSWORD     = 'YourPassword';              // change this (AuthMe password)

const OWNER        = 'YourName';                  // your minecraft username

// Optional disconnect cycle
const CYCLE_ENABLED   = true;            // true = disconnect every 5 min, false = stay forever
const STAY_DURATION   = 5 * 60 * 1000;  // 5 minutes
const RECONNECT_DELAY = 30 * 1000;      // 30 seconds
// ===================

let cycleTimer = null;

function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: VERSION
  });

  bot.on('spawn', () => {
    console.log('✅ Bot spawned!');

    // Step 1: Register
    setTimeout(() => {
      console.log('Registering...');
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    }, 1500);

    // Step 2: Login
    setTimeout(() => {
      console.log('Logging in...');
      bot.chat(`/login ${PASSWORD}`);
    }, 3500);

    // Step 3: Start everything after login
    setTimeout(() => {
      startMovement();
      startChat();
      startCombat();

      if (CYCLE_ENABLED) {
        cycleTimer = setTimeout(() => {
          console.log('5 minutes done, disconnecting...');
          bot.end('Cycle disconnect');
        }, STAY_DURATION);
      }
    }, 5000);
  });

  // ===== MOVEMENT =====
  function startMovement() {
    console.log('Movement started...');
    setInterval(() => {
      try {
        const moves = ['forward', 'back', 'left', 'right'];
        const move = moves[Math.floor(Math.random() * moves.length)];
        bot.setControlState(move, true);
        setTimeout(() => bot.setControlState(move, false), 1000);

        if (Math.random() > 0.5) {
          bot.setControlState('jump', true);
          setTimeout(() => bot.setControlState('jump', false), 500);
        }

        bot.look(Math.random() * Math.PI * 2, Math.random() * 0.5 - 0.25, false);
      } catch (e) {
        console.log('Movement error:', e.message);
      }
    }, 3000);
  }

  // ===== CHAT =====
  function startChat() {
    console.log('Chat started...');
    const messages = [
      'afk farming',
      'brb',
      'lag',
      'collecting resources',
      'grinding',
      'building stuff'
    ];

    setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      try {
        bot.chat(msg);
      } catch (e) {
        console.log('Chat error:', e.message);
      }
    }, 60000 + Math.random() * 60000);
  }

  // ===== COMBAT =====
  function startCombat() {
    console.log('Combat started...');
    setInterval(() => {
      try {
        const entity = bot.nearestEntity(e =>
          e.type === 'mob' &&
          e.position.distanceTo(bot.entity.position) < 5
        );
        if (entity) {
          console.log('Attacking:', entity.name);
          bot.attack(entity);
        }
      } catch (e) {
        console.log('Combat error:', e.message);
      }
    }, 1000);
  }

  // ===== OWNER COMMANDS =====
  bot.on('chat', (username, message) => {
    if (username === OWNER) {
      if (message.startsWith('!bot ')) {
        const cmd = message.substring(5).trim();
        bot.chat(cmd);
      }
      if (message === '!stop') {
        bot.end('Owner stopped bot');
      }
      if (message === '!pos') {
        const pos = bot.entity.position;
        bot.chat(`X:${Math.floor(pos.x)} Y:${Math.floor(pos.y)} Z:${Math.floor(pos.z)}`);
      }
    }
  });

  // ===== AUTO RECONNECT =====
  bot.on('kicked', (reason) => console.log('Kicked:', reason));
  bot.on('error', (err) => console.log('Error:', err.message));
  bot.on('end', () => {
    if (cycleTimer) clearTimeout(cycleTimer);
    console.log(`Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
    setTimeout(createBot, RECONNECT_DELAY);
  });
}

createBot();
