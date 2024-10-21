export class RangedSoldier {
  constructor(x, y, speed, team, attackInterval = 1) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.team = team;
    this.maxHealth = 80;
    this.health = 80;
    this.size = 0.05; // 원형 병사 크기
    this.target = null;
    this.projectiles = []; // 발사체 목록
    this.knockbackDistance = 0;
    this.knockbackDirection = { x: 0, y: 0 };
    this.range = 0.5; // 사정거리

    this.attackInterval = attackInterval;
    this.lastAttackTime = 0;
    this.projectileSpeed = 0.5; // 발사체 속도
  }

  canAttack(currentTime) {
    return currentTime - this.lastAttackTime >= this.attackInterval;
  }

  attack(target, currentTime) {
    if (this.canAttack(currentTime)) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const direction = { x: dx / distance, y: dy / distance };

      this.projectiles.push({
        x: this.x,
        y: this.y,
        direction: direction,
        speed: this.projectileSpeed,
        damage: 10,
        hit: false,
      });

      this.lastAttackTime = currentTime;
      console.log(`Ranged soldier from team ${this.team} attacked!`);
    }
  }

  updateProjectiles(deltaTime) {
    this.projectiles.forEach((p) => {
      p.x += p.direction.x * p.speed * deltaTime;
      p.y += p.direction.y * p.speed * deltaTime;
      // 타겟 명중 여부 확인
      if (this.target && isInRange(p, this.target) && !p.hit) {
        this.target.takeDamage(p.damage, this); // 타겟에 데미지 적용
        p.hit = true; // 명중 처리
      }
    });

    // 화면 밖으로 나간 발사체 제거
    this.projectiles = this.projectiles.filter(
      (p) => !p.hit && p.x >= -1 && p.x <= 1 && p.y >= -1 && p.y <= 1
    );
  }

  moveToTarget(deltaTime) {
    if (this.knockbackDistance > 0) {
      this.x += this.knockbackDirection.x * deltaTime;
      this.y += this.knockbackDirection.y * deltaTime;
      this.knockbackDistance -= this.speed * deltaTime;
      return;
    }
    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.range) {
      // 일정 거리 이상일 때만 이동
      const directionX = dx / distance;
      const directionY = dy / distance;
      this.x += directionX * this.speed * deltaTime;
      this.y += directionY * this.speed * deltaTime;
    }
  }

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
      console.log(`A ${this.team} ranged soldier has fallen!`);
    }
  }

  isAlive() {
    return this.health > 0;
  }

  getColor() {
    return this.team === "red"
      ? [1.0, 0.5, 0.5, 1.0] // 연한 빨간색
      : [0.5, 0.5, 1.0, 1.0]; // 연한 파란색
  }
}

// 투사체와 타겟 간 거리 계산
function isInRange(projectile, target) {
  const dx = projectile.x - target.x;
  const dy = projectile.y - target.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 0.05; // 명중 범위 설정
}
