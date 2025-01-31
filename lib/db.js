const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Determinar o caminho do banco de dados
let dbFile;

if (process.env.DB_PATH) {
  dbFile = process.env.DB_PATH;
} else {
  dbFile = process.env.NODE_ENV === 'production' 
    ? './database.sqlite'
    : './database-dev.sqlite';
}

// Função para copiar o banco de dados se necessário
function copyDatabaseIfNeeded(source, destination) {
  console.log(`Verificando se o banco de dados destino (${destination}) existe...`);
  console.log(`Verificando se o banco de dados fonte (${source}) existe...`);

  const destinationExists = fs.existsSync(destination);
  const destinationIsEmpty = destinationExists ? fs.statSync(destination).size === 0 : false;
  const sourceExists = fs.existsSync(source);

  if (!destinationExists || destinationIsEmpty) {
    if (sourceExists) {
      fs.copyFileSync(source, destination);
      console.log(`Banco de dados copiado de ${source} para ${destination}`);
    } else {
      console.log(`Banco de dados fonte não encontrado. Não foi possível copiar.`);
    }
  } else {
    console.log(`Banco de dados destino já existe e não está vazio. Não é necessário copiar.`);
  }
}

if (dbFile === '/var/data/database.sqlite') {
  // Define os caminhos corretamente usando __dirname
  // Como db.js está em src/pages/api/, precisamos subir dois níveis para chegar a src/
  const sourceDB = path.resolve(__dirname, '../../initial_data/database.sqlite');
  const destinationDB = dbFile;
  
  // Copia o banco de dados se necessário
  copyDatabaseIfNeeded(sourceDB, destinationDB);
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
