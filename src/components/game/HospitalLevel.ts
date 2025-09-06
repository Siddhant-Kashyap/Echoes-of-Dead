import * as Phaser from 'phaser';
import { Zombie } from './Zombie';

export class HospitalLevel {
  private scene: Phaser.Scene;
  public obstacles: Phaser.Physics.Arcade.StaticGroup;
  public zombies: Zombie[] = [];
  private levelWidth: number = 3200; // Even larger for multi-level
  private levelHeight: number = 900; // Taller for 3 floors

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.obstacles = scene.physics.add.staticGroup();
  }

  create(player: any) {
    this.createMultiLevelStructure();
    this.createStairs();
    this.createElevators();
    this.createHospitalElements();
    this.spawnZombies(player);
  }

  private createMultiLevelStructure() {
    // Define floor heights (3 floors)
    const floorHeights = [
      this.levelHeight - 40,    // Ground floor
      this.levelHeight - 340,   // Second floor  
      this.levelHeight - 640    // Third floor
    ];

    floorHeights.forEach((floorY, floorIndex) => {
      // Create floor sections with gaps for stairs/elevators
      this.createFloorSections(floorY, floorIndex);
      
      // Create ceiling for floors above ground
      if (floorIndex > 0) {
        this.createCeiling(floorY - 100);
      }
    });
  }

  private createFloorSections(floorY: number, floorIndex: number) {
    const sectionWidth = 200;
    const gapWidth = 100; // Gaps for stairs/elevators
    
    for (let x = 0; x < this.levelWidth; x += sectionWidth + gapWidth) {
      // Create floor section
      for (let sectionX = x; sectionX < Math.min(x + sectionWidth, this.levelWidth); sectionX += 40) {
        this.scene.add.rectangle(sectionX + 20, floorY, 40, 40, 0x2a2a2a);
        this.obstacles.create(sectionX + 20, floorY, undefined).setSize(40, 40).setVisible(false);
        
        // Add occasional blood stains
        if (Math.random() < 0.1) {
          const stainSize = Math.random() * 10 + 3;
          this.scene.add.circle(sectionX + 20 + (Math.random() - 0.5) * 30, 
                               floorY - 15, 
                               stainSize, 0x4a1e1e, 0.7);
        }
      }
    }
  }

  private createCeiling(ceilingY: number) {
    for (let x = 0; x < this.levelWidth; x += 40) {
      this.scene.add.rectangle(x + 20, ceilingY, 40, 20, 0x1a1a1a);
      this.obstacles.create(x + 20, ceilingY, undefined).setSize(40, 20).setVisible(false);
    }
  }

  private createStairs() {
    // Create stairs connecting floors at specific intervals
    const stairPositions = [
      { x: 250, connectsFloor: 0 },  // Connect ground to 2nd floor
      { x: 650, connectsFloor: 1 },  // Connect 2nd to 3rd floor
      { x: 1050, connectsFloor: 0 }, // Another ground to 2nd
      { x: 1450, connectsFloor: 1 }, // Another 2nd to 3rd
      { x: 1850, connectsFloor: 0 }, // Another ground to 2nd
      { x: 2250, connectsFloor: 1 }  // Another 2nd to 3rd
    ];

    const floorHeights = [
      this.levelHeight - 40,    // Ground floor
      this.levelHeight - 340,   // Second floor  
      this.levelHeight - 640    // Third floor
    ];

    stairPositions.forEach(stair => {
      const bottomY = floorHeights[stair.connectsFloor];
      const topY = floorHeights[stair.connectsFloor + 1];
      const stairHeight = bottomY - topY;
      
      // Create stair steps
      const numSteps = 15;
      const stepWidth = 60 / numSteps;
      const stepHeight = stairHeight / numSteps;
      
      for (let i = 0; i < numSteps; i++) {
        const stepX = stair.x + (i * stepWidth) - 30;
        const stepY = bottomY - (i * stepHeight);
        
        // Visual step
        this.scene.add.rectangle(stepX, stepY, stepWidth + 2, 8, 0x333333);
        
        // Collision for step
        this.obstacles.create(stepX, stepY, undefined)
          .setSize(stepWidth + 2, 8).setVisible(false);
      }
      
      // Add handrails
      this.createHandrail(stair.x - 35, bottomY, stair.x + 35, topY);
    });
  }

  private createHandrail(x1: number, y1: number, x2: number, y2: number) {
    // Simple handrail visual
    const railColor = 0x444444;
    
    // Draw rail line (simplified as rectangles)
    const railLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    const rail = this.scene.add.rectangle((x1 + x2) / 2, (y1 + y2) / 2 - 20, railLength, 3, railColor);
    rail.setRotation(angle);
  }

  private createElevators() {
    // Create elevator shafts at specific positions
    const elevatorPositions = [
      { x: 450 },
      { x: 1250 },
      { x: 2050 }
    ];

    const floorHeights = [
      this.levelHeight - 40,    // Ground floor
      this.levelHeight - 340,   // Second floor  
      this.levelHeight - 640    // Third floor
    ];

    elevatorPositions.forEach(elevator => {
      // Create elevator shaft (visual)
      const shaftHeight = floorHeights[0] - floorHeights[2] + 100;
      this.scene.add.rectangle(elevator.x - 30, (floorHeights[0] + floorHeights[2]) / 2, 4, shaftHeight, 0x555555);
      this.scene.add.rectangle(elevator.x + 30, (floorHeights[0] + floorHeights[2]) / 2, 4, shaftHeight, 0x555555);
      
      // Create elevator platforms on each floor
      floorHeights.forEach(floorY => {
        const elevatorCar = this.scene.add.rectangle(elevator.x, floorY - 20, 50, 8, 0x666666);
        this.obstacles.create(elevator.x, floorY - 20, undefined).setSize(50, 8).setVisible(false);
        
        // Add elevator buttons (visual only for now)
        this.scene.add.rectangle(elevator.x - 35, floorY - 40, 6, 6, 0x888888);
      });
    });
  }

  private spawnZombies(player: any) {
    // Spawn zombies on all three floors
    const floorHeights = [
      this.levelHeight - 80,    // Ground floor (adjusted for zombie height)
      this.levelHeight - 380,   // Second floor  
      this.levelHeight - 680    // Third floor
    ];

    const zombieSpawns = [
      // Ground floor zombies
      { x: 150, y: floorHeights[0] },
      { x: 400, y: floorHeights[0] },
      { x: 800, y: floorHeights[0] },
      { x: 1200, y: floorHeights[0] },
      { x: 1600, y: floorHeights[0] },
      { x: 2000, y: floorHeights[0] },
      { x: 2400, y: floorHeights[0] },
      
      // Second floor zombies  
      { x: 350, y: floorHeights[1] },
      { x: 750, y: floorHeights[1] },
      { x: 1150, y: floorHeights[1] },
      { x: 1550, y: floorHeights[1] },
      { x: 1950, y: floorHeights[1] },
      { x: 2350, y: floorHeights[1] },
      
      // Third floor zombies
      { x: 300, y: floorHeights[2] },
      { x: 700, y: floorHeights[2] },
      { x: 1100, y: floorHeights[2] },
      { x: 1500, y: floorHeights[2] },
      { x: 1900, y: floorHeights[2] },
      { x: 2300, y: floorHeights[2] }
    ];

    zombieSpawns.forEach(spawn => {
      const zombie = new Zombie(this.scene, spawn.x, spawn.y, player);
      this.zombies.push(zombie);
    });
  }

  update() {
    // Update all zombies
    this.zombies.forEach(zombie => {
      if (zombie.isActive()) {
        zombie.update();
      }
    });
    
    // Clean up destroyed zombies
    this.zombies = this.zombies.filter(zombie => zombie.isActive());
  }

  private createHospitalElements() {
    this.createBeds();
    this.createMedicalEquipment();
    this.createDoors();
  }

  private createBeds() {
    // Beds distributed across all three floors
    const floorHeights = [
      this.levelHeight - 60,    // Ground floor
      this.levelHeight - 360,   // Second floor  
      this.levelHeight - 660    // Third floor
    ];

    const bedConfigs = [
      // Ground floor beds
      { x: 120, floor: 0 }, { x: 380, floor: 0 }, { x: 580, floor: 0 },
      { x: 780, floor: 0 }, { x: 1120, floor: 0 }, { x: 1520, floor: 0 },
      { x: 1720, floor: 0 }, { x: 2120, floor: 0 },
      
      // Second floor beds
      { x: 320, floor: 1 }, { x: 520, floor: 1 }, { x: 720, floor: 1 },
      { x: 1020, floor: 1 }, { x: 1420, floor: 1 }, { x: 1620, floor: 1 },
      { x: 2020, floor: 1 }, { x: 2320, floor: 1 },
      
      // Third floor beds
      { x: 270, floor: 2 }, { x: 470, floor: 2 }, { x: 670, floor: 2 },
      { x: 1070, floor: 2 }, { x: 1370, floor: 2 }, { x: 1570, floor: 2 },
      { x: 1970, floor: 2 }, { x: 2270, floor: 2 }
    ];

    bedConfigs.forEach(bed => {
      const y = floorHeights[bed.floor];
      const bedColor = Math.random() < 0.3 ? 0x4a3333 : 0x3a3a3a;
      
      this.scene.add.rectangle(bed.x, y, 60, 20, bedColor)
        .setStrokeStyle(2, 0x2a2a2a);
      
      // Add occasional blood puddles near beds
      if (Math.random() < 0.3) {
        this.scene.add.ellipse(bed.x + (Math.random() - 0.5) * 40, 
                               y + 15, 
                               15, 10, 0x4a1e1e, 0.8);
      }
    });
  }

  private createMedicalEquipment() {
    // Medical equipment on all floors
    const floorHeights = [
      this.levelHeight - 70,    // Ground floor
      this.levelHeight - 370,   // Second floor  
      this.levelHeight - 670    // Third floor
    ];

    const equipmentConfigs = [
      // Ground floor equipment
      { x: 180, floor: 0 }, { x: 480, floor: 0 }, { x: 880, floor: 0 },
      { x: 1280, floor: 0 }, { x: 1680, floor: 0 }, { x: 2280, floor: 0 },
      
      // Second floor equipment
      { x: 380, floor: 1 }, { x: 780, floor: 1 }, { x: 1180, floor: 1 },
      { x: 1580, floor: 1 }, { x: 2180, floor: 1 },
      
      // Third floor equipment
      { x: 330, floor: 2 }, { x: 730, floor: 2 }, { x: 1130, floor: 2 },
      { x: 1530, floor: 2 }, { x: 2130, floor: 2 }
    ];

    equipmentConfigs.forEach(equipment => {
      const y = floorHeights[equipment.floor];
      
      // Broken, rusty medical equipment
      this.scene.add.rectangle(equipment.x, y, 20, 30, 0x2a1e1e);
      
      // Add flickering light effect to some equipment
      if (Math.random() < 0.4) {
        const light = this.scene.add.circle(equipment.x, y - 20, 4, 0xff4444, 0.8);
        
        // Create flickering animation
        this.scene.tweens.add({
          targets: light,
          alpha: { from: 0.8, to: 0.2 },
          duration: 200 + Math.random() * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Power2'
        });
      }
    });
  }

  private createDoors() {
    const doorPositions = [
      { x: 450, y: 300 },
      { x: 750, y: 300 }
    ];

    doorPositions.forEach(pos => {
      // Weathered, dark doors
      this.scene.add.rectangle(pos.x, pos.y, 40, 20, 0x2d1e1a);
      
      // Add scratches or damage marks
      if (Math.random() < 0.7) {
        this.scene.add.rectangle(
          pos.x + (Math.random() - 0.5) * 30, 
          pos.y + (Math.random() - 0.5) * 15, 
          2, 8, 0x1a1a1a, 0.8
        );
      }
    });

    // Add eerie atmospheric elements
    this.createAtmosphericEffects();
  }

  private createAtmosphericEffects() {
    // Add dim overhead lights with flickering
    const lightPositions = [
      { x: 600, y: 150 }, { x: 150, y: 300 }, { x: 1050, y: 300 },
      { x: 300, y: 450 }, { x: 900, y: 450 }
    ];

    lightPositions.forEach(pos => {
      const light = this.scene.add.circle(pos.x, pos.y, 8, 0x665533, 0.4);
      
      // Flickering effect
      this.scene.tweens.add({
        targets: light,
        alpha: { from: 0.4, to: 0.1 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Power2'
      });
    });

    // Add some debris scattered around
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 1180 + 20;
      const y = Math.random() * 580 + 20;
      const size = Math.random() * 8 + 3;
      this.scene.add.circle(x, y, size, 0x2a2a2a, 0.6);
    }
  }

  getObstacles() {
    return this.obstacles;
  }
}