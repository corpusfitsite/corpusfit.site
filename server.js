const express = require('express');
const next = require('next');
const path = require('path');
const fs = require('fs');
const db = require('./lib/db'); 
// Definimos o diretório de uploads a partir da variável de ambiente, ou default local
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');

// Cria a pasta, caso não exista
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Identificar o ambiente atual
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Log do ambiente para facilitar debug
  console.log(`Servidor rodando no modo ${process.env.NODE_ENV.toUpperCase()}`);

  // Servimos arquivos estáticos do diretório de uploads
  server.use('/uploads', express.static(uploadsDir));

  // Rota de teste em desenvolvimento
  if (dev) {
    server.get('/test', (req, res) => {
      res.send('Rota de teste no ambiente de desenvolvimento!');
    });
  }

  // Rota padrão para o Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Rota Temporária para Resetar o Banco de Dados
  app.get('/reset-db', (req, res) => {
    const destinationDB = '/var/data/database.sqlite';
    
    try {
      if (fs.existsSync(destinationDB)) {
        fs.unlinkSync(destinationDB);
        console.log(`Banco de dados destino (${destinationDB}) removido.`);
        res.send('Banco de dados resetado com sucesso.');
      } else {
        res.send('Banco de dados destino não existe.');
      }
    } catch (error) {
      console.error(`Erro ao remover o banco de dados destino: ${error.message}`);
      res.status(500).send(`Erro ao resetar o banco de dados: ${error.message}`);
    }
  });

  // Porta dinâmica baseada no ambiente
  const port = process.env.PORT || 3001;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Servidor pronto na porta ${port}`);
  });
});
