import * as Phaser from 'phaser';

export class Bullet {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.Body;
  private speed: number = 800;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    this.scene = scene;
    
    // Create bullet sprite
    this.sprite = scene.add.rectangle(x, y, 4, 2, 0xffff00);
    this.sprite.setRotation(angle);
    
    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Set velocity based on angle
    const velocityX = Math.cos(angle) * this.speed;
    const velocityY = Math.sin(angle) * this.speed;
    this.body.setVelocity(velocityX, velocityY);
    
    // Auto-destroy after 3 seconds
    scene.time.delayedCall(3000, () => {
      this.destroy();
    });
  }

  destroy() {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }

  isActive(): boolean {
    return this.sprite && this.sprite.active;
  }
}