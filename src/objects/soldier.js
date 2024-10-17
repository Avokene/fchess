export class Soldier {
  constructor(x, y, speed, team) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.team = team;
    this.health = 100;
    this.size = 0.05;
    this.target = null;
    this.knockbackDistance = 0; // 넉백 거리 초기화
    this.knockbackDirection = { x: 0, y: 0 };
  }

  moveToTarget(deltaTime) {
    if (this.knockbackDistance > 0) {
      // 넉백 중일 때 이동
      this.x += this.knockbackDirection.x * deltaTime;
      this.y += this.knockbackDirection.y * deltaTime;
      this.knockbackDistance -= this.speed * deltaTime;
      return; // 넉백 중일 땐 타겟을 향해 이동하지 않음
    }

    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.size) {
      const directionX = dx / distance;
      const directionY = dy / distance;
      this.x += directionX * this.speed * deltaTime;
      this.y += directionY * this.speed * deltaTime;
    }
  }

  takeDamage(damage, attacker) {
    this.health -= damage;

    // 공격자가 있을 경우 넉백 방향 설정
    if (attacker) {
      const dx = this.x - attacker.x;
      const dy = this.y - attacker.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.knockbackDirection = { x: dx / distance, y: dy / distance };
      this.knockbackDistance = 0.03; // 넉백 거리 설정 (0.01)
    }

    if (this.health <= 0) {
      console.log(`A ${this.team} soldier has fallen!`);
    }
  }

  isAlive() {
    return this.health > 0;
  }

  // 팀에 따라 색상을 반환하는 메서드
  getColor() {
    if (this.team === "red") {
      return [1.0, 0.0, 0.0, 1.0]; // 빨간색 (RGBA)
    } else {
      return [0.0, 0.0, 1.0, 1.0]; // 파란색 (RGBA)
    }
  }
}
