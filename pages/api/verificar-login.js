// pages/api/verificar-login.js
import db from '../../lib/db';

export default async function handler(req, res) {
  const { login } = req.query;

  if (!login) {
    return res.status(400).json({ error: 'Login não fornecido' });
  }

  // Helper para usar db.get com Promise/async
  const getAsync = (sql, params) =>
    new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });

  try {
    // Atenção: usamos a tabela 'users' (não 'alunos'), já que é lá que o campo login vive
    const existente = await getAsync(
      'SELECT id FROM users WHERE login = ?',
      [login]
    );

    // Se EXISTENTE for undefined => não achou ninguém => login disponível
    return res.status(200).json({ available: !existente });
  } catch (err) {
    console.error('Erro ao verificar login:', err);
    return res.status(500).json({ error: 'Erro ao verificar login' });
  }
}
