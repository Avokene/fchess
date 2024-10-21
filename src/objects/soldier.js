export class Soldier {
  constructor(x, y, speed, team, attackInterval = 1) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.team = team;
    this.health = 100;
    this.size = 0.05;
    this.target = null;
    this.knockbackDistance = 0;
    this.knockbackDirection = { x: 0, y: 0 };

    this.attackInterval = attackInterval; // 공격 속도 (초 단위)
    this.lastAttackTime = 0; // 마지막 공격 시점
  }

  // 공격 가능한지 확인
  canAttack(currentTime) {
    return currentTime - this.lastAttackTime >= this.attackInterval;
  }

  // 공격 실행
  attack(target, currentTime) {
    if (this.canAttack(currentTime)) {
      target.takeDamage(10, this); // 10의 피해를 줌 (넉백 포함)
      this.lastAttackTime = currentTime; // 공격 시점 갱신
      console.log(`Soldier from team ${this.team} attacked!`);
    }
  }

  // 타겟을 향해 이동 (사정거리 내에 있으면 이동 멈춤)
  moveToTarget(deltaTime) {
    if (this.knockbackDistance > 0) {
      // 넉백 중일 때 이동
      this.x += this.knockbackDirection.x * deltaTime;
      this.y += this.knockbackDirection.y * deltaTime;
      this.knockbackDistance -= this.speed * deltaTime;
      return; // 넉백 중일 때는 이동하지 않음
    }

    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.size + 0.1) {
      // 사정거리 내에 타겟이 있으면 이동하지 않음
      return;
    }

    // 타겟이 사정거리 밖에 있으면 계속 이동
    const directionX = dx / distance;
    const directionY = dy / distance;
    this.x += directionX * this.speed * deltaTime;
    this.y += directionY * this.speed * deltaTime;
  }

  // 피해 처리
  takeDamage(damage, attacker) {
    this.health -= damage;

    if (attacker) {
      const dx = this.x - attacker.x;
      const dy = this.y - attacker.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.knockbackDirection = { x: dx / distance, y: dy / distance };
      this.knockbackDistance = 0.03; // 넉백 거리 설정
    }

    if (this.health <= 0) {
      console.log(`A ${this.team} soldier has fallen!`);
    }
  }

  // 살아 있는지 확인
  isAlive() {
    return this.health > 0;
  }

  // 팀 색상 반환
  getColor() {
    return this.team === "red"
      ? [1.0, 0.0, 0.0, 1.0] // 빨간색
      : [0.0, 0.0, 1.0, 1.0]; // 파란색
  }
}
