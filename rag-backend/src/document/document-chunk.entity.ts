import { Entity, PrimaryColumn, Column, CreateDateColumn, BeforeInsert } from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = randomUUID();
  }

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  fileName: string;

  @Column({ type: 'int' })
  chunkIndex: number;

  /**
   * Float array stored as JSON text: "[0.12, -0.34, ...]".
   * Cast to ::vector inline in raw SQL queries.
   * TypeORM has no native vector column type — this avoids driver patching.
   */
  @Column({ type: 'text' })
  embedding: string;

  @CreateDateColumn()
  createdAt: Date;
}
