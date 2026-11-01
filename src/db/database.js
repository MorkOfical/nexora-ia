import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDirectory, '../..');
const dataDirectory = path.join(projectRoot, 'data');

mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, 'nexora-ia.sqlite'));
database.pragma('foreign_keys = ON');
database.pragma('journal_mode = WAL');
database.exec(readFileSync(path.join(currentDirectory, 'schema.sql'), 'utf8'));

export default database;
