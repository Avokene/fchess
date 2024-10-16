export class Soldier {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.health = 100;
  }

  move(deltaTime) {
    this.x += this.speed * deltaTime;
  }

  takeDamage(damage) {
    this.health -= damage;
  }
}
