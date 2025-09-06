'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.physics.world.setBounds(0, 0, 1200, 600);

    this.player = this.add.rectangle(600, 300, 32, 32, 0x00ff00);
    this.physics.add.existing(this.player);
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as any;
  }

  update() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = 200;

    playerBody.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      playerBody.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      playerBody.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      playerBody.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      playerBody.setVelocityY(speed);
    }
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
      height: 600,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: GameScene,
      backgroundColor: '#2c3e50'
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