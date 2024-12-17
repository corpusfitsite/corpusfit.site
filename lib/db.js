const sqlite3 = require('sqlite3').verbose();

// Primeiro tentamos usar a variável de ambiente DB_PATH
// Caso não exista, definimos um padrão baseado no NODE_ENV
let dbFile;

if (process.env.DB_PATH) {
  dbFile = process.env.DB_PATH;
} else {
  // Se não houver DB_PATH, usamos a lógica antiga baseada no ambiente
  dbFile = process.env.NODE_ENV === 'production' 
    ? './database.sqlite'
    : './database-dev.sqlite';
}

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error(`Erro ao abrir o banco de dados em ${dbFile}:`, err.message);
  } else {
    console.log(`Conexão com o banco de dados estabelecida em ${dbFile} (${process.env.NODE_ENV})`);
  }
});

// Criação das tabelas (permanece igual)

// Tabela 'users'
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('aluno', 'professor', 'admin')) NOT NULL
  )
`);

// Tabela 'treinos'
db.run(`
  CREATE TABLE IF NOT EXISTS treinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES users(id)
  )
`);

// Tabela 'exercicios'
db.run(`
  CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treino_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    carga INTEGER NOT NULL,
    repeticoes INTEGER NOT NULL,
    FOREIGN KEY (treino_id) REFERENCES treinos(id)
  )
`);

// Tabela 'treino_sessions'
db.run(`
  CREATE TABLE IF NOT EXISTS treino_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL,
    treino_id INTEGER NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES users(id),
    FOREIGN KEY (treino_id) REFERENCES treinos(id)
  )
`);

// Tabela 'cards'
db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    category TEXT CHECK(category IN ('PLANOS', 'AVISOS', 'AULAS')) NOT NULL
  )
`);

module.exports = db;
