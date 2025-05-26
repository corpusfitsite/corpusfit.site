// pages/api/registro.js
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    login,
    password,
    role = 'aluno',       // valor padrão, ajuste se quiser
    birth_date = null,
    cpf = null,
    email = null,
    telefone = null,
    photo_path = null
  } = req.body;

  // Função helper para rodar db.run com Promise
  const runAsync = (sql, params) =>
    new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        // this.lastID é o ID da linha inserida
        resolve({ id: this.lastID });
      });
    });

  try {
    const { id } = await runAsync(
      `INSERT INTO users
        (name, login, password, role, birth_date, cpf, email, telefone, photo_path)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [name, login, password, role, birth_date, cpf, email, telefone, photo_path]
    );

    return res.status(201).json({ id });
  } catch (err) {
    console.error('Erro no registro:', err);
    // Se for violação de UNIQUE (login repetido), sqlite retorna err.code === 'SQLITE_CONSTRAINT'
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Login já existe' });
    }
    return res.status(500).json({ error: err.message });
  }
}
