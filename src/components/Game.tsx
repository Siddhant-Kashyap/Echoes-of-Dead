'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { Player } from './game/Player';
import { HospitalLevel } from './game/HospitalLevel';
import { InputManager } from './game/InputManager';

class GameScene extends Phaser.Scene {
  private player!: Player;
  private hospitalLevel!: HospitalLevel;
  private inputManager!: InputManager;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Extended world bounds for multi-level side-scrolling
    this.physics.world.setBounds(0, 0, 3200, 900);

    // Initialize player first (start on ground floor)
    this.player = new Player(this, 100, 800);
    this.inputManager = new InputManager(this);

    // Initialize level with player reference for zombies
    this.hospitalLevel = new HospitalLevel(this);
    this.hospitalLevel.create(this.player);

    // Setup collisions
    this.physics.add.collider(this.player.sprite, this.hospitalLevel.getObstacles());
    
    // Setup bullet vs zombie collisions
    this.setupBulletCollisions();
    
    // Setup camera to follow player with smooth following
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, 3200, 900);
    this.cameras.main.setZoom(0.8); // Zoom out to see more of the multi-level structure

    // Mouse aiming and shooting
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.player.updateGunAiming(pointer);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.player.shoot(pointer);
      }
    });
  }

  private setupBulletCollisions() {
    // Check collisions every frame
    this.physics.world.on('worldstep', () => {
      const bullets = this.player.getBullets();
      const zombies = this.hospitalLevel.zombies;

      bullets.forEach(bullet => {
        if (!bullet.isActive()) return;
        
        zombies.forEach(zombie => {
          if (!zombie.isActive()) return;
          
          // Check if bullet overlaps with zombie
          if (Phaser.Geom.Rectangle.Overlaps(
            bullet.sprite.getBounds(),
            zombie.sprite.getBounds()
          )) {
            zombie.takeDamage();
            bullet.destroy();
          }
        });
      });
    });
  }

  update() {
    const inputState = this.inputManager.getInputState();
    this.player.update(inputState);
    this.hospitalLevel.update();
  }
}

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 700,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: GameScene,
      backgroundColor: '#0a0a0a'
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  return <div ref={gameRef} className="mx-auto" />;
}