// pages/api/aprovar-aluno.js

import db from '../../lib/db';

export const config = {
  api: {
    bodyParser: true,
  },
};

const dbRun = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const handler = async (req, res) => {
  if (req.method === 'PUT') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do aluno é obrigatório.' });
    }

    try {
      const result = await dbRun(
        'UPDATE users SET aprovado = 1 WHERE id = ? AND role = "aluno"',
        [id]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Aluno não encontrado ou já aprovado.' });
      }

      return res.status(200).json({ message: 'Aluno aprovado com sucesso.' });
    } catch (err) {
      console.error('Erro ao aprovar aluno:', err);
      return res.status(500).json({ error: 'Erro interno ao aprovar aluno.' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido. Use PUT.' });
  }
};

export default handler;
