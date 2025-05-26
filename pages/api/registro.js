import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { nome, email, senha, idade, peso, altura } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
  }

  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Verifica se o email já está cadastrado
    const existente = await db.get('SELECT * FROM alunos WHERE email = ?', [email]);
    if (existente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Insere o novo aluno com aprovado = false
    await db.run(
      `INSERT INTO alunos (nome, email, senha, idade, peso, altura, aprovado)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [nome, email, senha, idade, peso, altura]
    );

    res.status(201).json({ mensagem: 'Cadastro enviado para aprovação do professor' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
}
