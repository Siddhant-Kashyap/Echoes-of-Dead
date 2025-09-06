import * as Phaser from 'phaser';
import { Bullet } from './Bullet';

export class Player {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.Body;
  public gun: Phaser.GameObjects.Rectangle;
  private speed: number = 200;
  private scene: Phaser.Scene;
  private lastFireTime: number = 0;
  private fireRate: number = 200; // milliseconds between shots
  public bullets: Bullet[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    // Create player sprite (side-scrolling character)
    this.sprite = scene.add.rectangle(x, y, 20, 32, 0x00ff00);
    
    // Create gun sprite
    this.gun = scene.add.rectangle(x + 15, y, 20, 4, 0x666666);
    this.gun.setOrigin(0, 0.5); // Set origin to left side for rotation
    
    // Add physics to player only
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    
    // Add gravity for side-scrolling
    this.body.setGravityY(800);
  }

  update(input: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    // Side-scrolling movement (A/D only)
    if (input.left) {
      this.body.setVelocityX(-this.speed);
    } else if (input.right) {
      this.body.setVelocityX(this.speed);
    } else {
      this.body.setVelocityX(0);
    }

    // Jumping
    if (input.up && this.body.touching.down) {
      this.body.setVelocityY(-400);
    }

    // Update gun position to follow player
    this.gun.setPosition(this.sprite.x + 10, this.sprite.y);

    // Clean up destroyed bullets
    this.bullets = this.bullets.filter(bullet => bullet.isActive());
  }

  updateGunAiming(pointer: Phaser.Input.Pointer) {
    // Calculate angle from gun to mouse pointer
    const angle = Phaser.Math.Angle.Between(
      this.gun.x, this.gun.y,
      pointer.worldX, pointer.worldY
    );
    
    this.gun.setRotation(angle);
  }

  shoot(pointer: Phaser.Input.Pointer): boolean {
    const currentTime = this.scene.time.now;
    
    if (currentTime - this.lastFireTime < this.fireRate) {
      return false; // Too soon to fire again
    }
    
    this.lastFireTime = currentTime;
    
    // Calculate shooting angle
    const angle = Phaser.Math.Angle.Between(
      this.gun.x, this.gun.y,
      pointer.worldX, pointer.worldY
    );
    
    // Create bullet at gun tip
    const gunTipX = this.gun.x + Math.cos(angle) * 20;
    const gunTipY = this.gun.y + Math.sin(angle) * 20;
    
    const bullet = new Bullet(this.scene, gunTipX, gunTipY, angle);
    this.bullets.push(bullet);
    
    return true;
  }

  getBullets(): Bullet[] {
    return this.bullets.filter(bullet => bullet.isActive());
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }
}