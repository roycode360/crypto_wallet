import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1739788928407 implements MigrationInterface {
    name = 'InitSchema1739788928407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Users" ("id" SERIAL NOT NULL, "username" character varying, "walletAddress" character varying NOT NULL, CONSTRAINT "UQ_ffc81a3b97dcbf8e320d5106c0d" UNIQUE ("username"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Challenge" ("id" SERIAL NOT NULL, "walletAddress" character varying NOT NULL, "nonce" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "UQ_066df22413241452d5b9286fccb" UNIQUE ("walletAddress"), CONSTRAINT "PK_33b9f5f1196a8c9d9bd6a8f8f5d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Challenge"`);
        await queryRunner.query(`DROP TABLE "Users"`);
    }

}
