import {
  IsDate,
  IsUrl,
  IsOptional,
  IsDefined,
  IsNotEmpty,
  IsIn,
  validate
} from 'class-validator';

import { Geometry } from 'geojson';

import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  UpdateDateColumn,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index
} from 'typeorm';

import { User } from './User';

@Entity('items')
export class Item extends BaseEntity  {
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    const errors = await validate(this);

    if (errors.length > 0) {
      throw errors;
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.items)
  @JoinColumn({
    name: 'user_id'
  })
  user: User;

  @Column({
    nullable: true
  })
  contact: string;

  @Column('geometry', {
    nullable: true,
    spatialFeatureType: 'Geometry',
    srid: 4326
  })
  @Index({
    spatial: true
  })
  geom: Geometry;

  @IsUrl({
    protocols: ['http', 'https', 's3'],
    require_tld: false,
    require_protocol: true
  })
  @Column({
    name: 'thumbnail',
    nullable: true
  })
  thumbnail: string;

  @Column({
    nullable: true
  })
  crs: string;

  @Column('double precision', {
    nullable: true
  })
  @Index()
  gsd: number;

  @Column('bigint', {
    name: 'file_size',
    nullable: true
  })
  fileSize: number;

  @Column('text')
  @IsUrl({
    protocols: ['http', 'https', 's3'],
    require_tld: false,
    require_protocol: true
  })
  href: string;

  @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at'
  })
  updatedAt: Date;

  @Column({
    nullable: true
  })
  @IsNotEmpty()
  title: string;

  @Column({
    nullable: true
  })
  license: string;

  @IsDate()
  datetime: Date;

  @Column({
    name: 'start_datetime',
    nullable: true
  })
  @Index()
  @IsOptional()
  @IsDate()
  startDatetime: Date;

  @Column({
    name: 'end_datetime',
    nullable: true
  })
  @Index()
  @IsOptional()
  @IsDate()
  endDatetime: Date;

  @Column({
    nullable: true
  })
  @IsIn(['satellite', 'aircraft', 'uav', 'balloon', 'kite'])
  platform: string;

  @Column({
    nullable: true
  })
  instrument: string;

  @Column({
    nullable: true
  })
  keywords: string;

  @Column({
    nullable: true
  })
  @IsNotEmpty()
  provider: string;
}
