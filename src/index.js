const { Vec3 } = require('vec3');

let targetVelocity = new Vec3(0, 0, 0);
let previousPosition = null;
let previousPositionDate = null;

function init() {
  return inject;
}

function inject(bot) {
  let enabled = false;
  let target = null;

  bot.enableArchery = () => {
    enabled = true;
    setInterval(() => {
      target = nearestEnemy();
      shootArrow(target);
    }, 3000);
  };

  bot.disableArchery = () => {
    enabled = false;
  };

  function hasArcheryEquipment() {
    const mcData = require('minecraft-data')(bot.version);
    const bowId = mcData.itemsByName.bow.id;
    const arrowId = mcData.itemsByName.arrow.id;

    const bowItem = bot.inventory.findInventoryItem(bowId);
    const arrowItem = bot.inventory.findInventoryItem(arrowId);

    if (bowItem) {
      bot.equip(bowItem, 'hand');
    }

    if (bowItem && arrowItem) {
      console.log('Equipped');
    }
    return bowItem && arrowItem;
  }

  bot.hasArcheryEquipment = () => hasArcheryEquipment;

  bot.on('entityMoved', (entity) => {
    // TODO: Refactor

    if (entity.username === target) {
      const now = new Date();
      if (previousPositionDate != null) {
        const deltaTime = now - previousPositionDate;
        if (deltaTime > 0.000001) {
          targetVelocity = entity.position.minus(previousPosition).scaled(1 / deltaTime);
        }
      }
      previousPositionDate = now;
      previousPosition = entity.position.clone();
    }
  });

  function nearestEnemy() {
    // TODO: This gets nearest entity, does not check if its an 'enemy'

    let best = null;
    let bestDistance = null;

    for (const entity of Object.values(bot.entities)) {
      if (entity === bot.entity) return;

      const dist = bot.entity.position.distanceTo(entity.position);

      if (!best || dist < bestDistance) {
        best = entity;
        bestDistance = dist;
      }
    }
    return best;
  }

  function shootArrow(target) {
    /** TODO:
      - simply the control flow of the draw, look, release in a way thats more comprehensible
      - error handling for when target is invalid / out of range
    * */

    if (!enabled || !hasArcheryEquipment()) return;

    bot.activateItem();
    const lookInterval = setInterval(look, 20);
    // TODO: change static bow draw time, it takes less than 1500ms in cases like having quick draw
    setTimeout(release, 1500);

    function look() {
      const distance = bot.entity.position.distanceTo(target.position);
      const heightAdjust = target.height * 0.8 + (distance * 0.05);
      bot.lookAt(target.position.offset(0, heightAdjust, 0).plus(targetVelocity.scaled(650)));
    }

    function release() {
      clearInterval(lookInterval);
      look();
      bot.deactivateItem();
    }
  }
}

module.exports = init;
