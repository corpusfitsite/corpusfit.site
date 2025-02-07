// src/pages/api/payments.js
import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { aluno_id } = req.query;
    db.get("SELECT paymentData FROM payments WHERE aluno_id = ?", [aluno_id], (err, row) => {
      if (err) {
        console.error('GET error:', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (row && row.paymentData) {
        try {
          const paymentData = JSON.parse(row.paymentData);
          res.status(200).json({ paymentData });
        } catch (parseError) {
          console.error('Parse error:', parseError.message);
          res.status(500).json({ error: parseError.message });
        }
      } else {
        res.status(200).json({ paymentData: null });
      }
    });
  } else if (req.method === 'POST') {
    try {
      // Recebe { aluno_id, paymentData } do front-end
      const { aluno_id, paymentData } = req.body;
      if (!aluno_id || !paymentData) {
        return res.status(400).json({ error: "Dados inválidos" });
      }
      const paymentDataStr = JSON.stringify(paymentData);
      
      // Tente atualizar o registro existente
      db.run(
        "UPDATE payments SET paymentData = ?, updated_at = CURRENT_TIMESTAMP WHERE aluno_id = ?",
        [paymentDataStr, aluno_id],
        function (err) {
          if (err) {
            console.error('Update error:', err.message);
            return res.status(500).json({ error: err.message });
          }
          console.log("this.changes:", this.changes);
          if (this.changes === 0) {
            // Se não houve atualização, insira um novo registro
            db.run(
              "INSERT INTO payments (aluno_id, paymentData) VALUES (?, ?)",
              [aluno_id, paymentDataStr],
              function (err) {
                if (err) {
                  console.error('Insert error:', err.message);
                  return res.status(500).json({ error: err.message });
                }
                return res.status(200).json({ message: "Pagamento salvo com sucesso" });
              }
            );
          } else {
            return res.status(200).json({ message: "Pagamento atualizado com sucesso" });
          }
        }
      );
    } catch (error) {
      console.error('POST catch error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
