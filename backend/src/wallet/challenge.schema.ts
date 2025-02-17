import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Challenge')
export class Challenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  walletAddress: string;

  @Column()
  nonce: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
