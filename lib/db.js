const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Determinar o caminho do banco de dados
let dbFile;

if (process.env.DB_PATH) {
  dbFile = process.env.DB_PATH;
} else {
  dbFile = process.env.NODE_ENV === 'production' 
    ? '/var/data/database.sqlite'
    : path.resolve(process.cwd(), 'src', 'initial_data', 'database-dev.sqlite');
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
  // Define os caminhos corretamente usando process.cwd()
  const sourceDB = path.resolve(process.cwd(), 'initial_data', 'database.sqlite');
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

// Criar tabela 'users' (para alunos e professores) com o campo 'login'
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('aluno', 'professor', 'admin')) NOT NULL
  )
`);

db.serialize(() => {
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error("Erro ao checar colunas de users:", err);
      return;
    }
    const names = columns.map(c => c.name);

    // Colunas que queremos garantir
    const toAdd = [
      { name: "birth_date",   sql: "ALTER TABLE users ADD COLUMN birth_date TEXT" },
      { name: "cpf",          sql: "ALTER TABLE users ADD COLUMN cpf TEXT" },
      { name: "email",        sql: "ALTER TABLE users ADD COLUMN email TEXT" },
      { name: "telefone",     sql: "ALTER TABLE users ADD COLUMN telefone TEXT" },
      { name: "photo_path",   sql: "ALTER TABLE users ADD COLUMN photo_path TEXT" },
      { name: "aprovado",     sql: "ALTER TABLE users ADD COLUMN aprovado BOOLEAN DEFAULT 0" },
    ];

    toAdd.forEach(col => {
      if (!names.includes(col.name)) {
        db.run(col.sql, [], err => {
          if (err) {
            console.error(`Erro ao adicionar coluna ${col.name}:`, err.message);
          } else {
            console.log(`Coluna '${col.name}' adicionada em 'users'.`);
          }
        });
      }
    });
  });
});


// Criar tabela 'treinos' (para armazenar os treinos)
db.run(`
  CREATE TABLE IF NOT EXISTS treinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES users(id)
  )
`);

// Criar tabela 'exercicios' (para armazenar os exercícios de cada treino)
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

// Criar tabela 'treino_sessions' (para registrar as sessões de treino dos alunos)
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

// Criar tabela 'cards' (para armazenar os cards)
db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    category TEXT CHECK(category IN ('PLANOS', 'AVISOS', 'AULAS')) NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER NOT NULL UNIQUE,
    paymentData TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Erro ao criar a tabela payments:', err.message);
  } else {
    console.log('Tabela payments criada ou já existente.');
  }
});

module.exports = db;
