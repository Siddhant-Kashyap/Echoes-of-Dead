import * as Phaser from 'phaser';

export class Zombie {
  public sprite: Phaser.GameObjects.Rectangle;
  public body: Phaser.Physics.Arcade.Body;
  private speed: number = 50;
  private health: number = 1;
  private scene: Phaser.Scene;
  private player: any; // Reference to player for following behavior

  constructor(scene: Phaser.Scene, x: number, y: number, player: any) {
    this.scene = scene;
    this.player = player;
    
    // Create zombie sprite (dark red square for now)
    this.sprite = scene.add.rectangle(x, y, 24, 32, 0x4a1e1e);
    
    // Add physics
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    
    // Add gravity for side-scrolling
    this.body.setGravityY(500);
  }

  update() {
    if (!this.sprite.active) return;
    
    // Simple AI: move toward player
    const playerX = this.player.sprite.x;
    const zombieX = this.sprite.x;
    
    if (Math.abs(playerX - zombieX) > 10) {
      if (playerX < zombieX) {
        this.body.setVelocityX(-this.speed);
      } else {
        this.body.setVelocityX(this.speed);
      }
    } else {
      this.body.setVelocityX(0);
    }
  }

  takeDamage(damage: number = 1) {
    this.health -= damage;
    
    // Flash red when hit by changing fill color
    const originalColor = this.sprite.fillColor;
    this.sprite.setFillStyle(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.setFillStyle(originalColor);
      }
    });
    
    if (this.health <= 0) {
      this.destroy();
    }
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