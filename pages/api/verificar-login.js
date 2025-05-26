import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default async function handler(req, res) {
  const { login } = req.query;

  if (!login) return res.status(400).json({ error: 'Login não fornecido' });

  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    const existente = await db.get('SELECT id FROM alunos WHERE login = ?', [login]);
    return res.status(200).json({ available: !existente });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao verificar login' });
  }
}
