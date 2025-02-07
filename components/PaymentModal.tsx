import React, { useEffect, useState } from 'react';
import styles from '../styles/PaymentModal.module.css';

export interface PaymentData {
  enrollmentDate: string;
  enrollmentFee: number;
  dueDay: number;
  history: Record<string, boolean>;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  initialPaymentData?: PaymentData;
  onSave: (studentId: number, paymentData: PaymentData) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  studentId,
  initialPaymentData,
  onSave,
}) => {
  // Função para obter o mês atual
  const getCurrentMonth = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${('0' + (today.getMonth() + 1)).slice(-2)}`;
  };

  // Estados dos inputs – sem o campo paymentDate (que foi removido)
  const [enrollmentDate, setEnrollmentDate] = useState<string>('');
  const [enrollmentFee, setEnrollmentFee] = useState<number>(0);
  const [dueDay, setDueDay] = useState<number>(0);
  
  // Estado do histórico de pagamentos
  const [paymentHistory, setPaymentHistory] = useState<Record<string, boolean>>({});

  // Gera a lista de meses (exemplo: de Fevereiro de 2025 até o mês atual)
  const generateMonthList = (): string[] => {
    const start = new Date(2025, 1);
    const today = new Date();
    const months: string[] = [];
    let current = new Date(today.getFullYear(), today.getMonth(), 1);
    while (current >= start) {
      const monthStr = `${current.getFullYear()}-${('0' + (current.getMonth() + 1)).slice(-2)}`;
      months.push(monthStr);
      current.setMonth(current.getMonth() - 1);
    }
    return months;
  };

  const [monthList] = useState<string[]>(generateMonthList());

  // Quando o modal abre, busque os dados salvos do back-end (se houver)
  useEffect(() => {
    if (isOpen) {
      fetch(`/api/payments?aluno_id=${studentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.paymentData) {
            const pd: PaymentData = data.paymentData;
            setEnrollmentDate(pd.enrollmentDate || '');
            setEnrollmentFee(pd.enrollmentFee || 0);
            setDueDay(pd.dueDay || 0);
            setPaymentHistory(pd.history || {});
          } else {
            // Se não houver dados salvos, inicialize com valores padrão
            setEnrollmentDate('');
            setEnrollmentFee(0);
            setDueDay(0);
            const initialHistory: Record<string, boolean> = {};
            monthList.forEach((month) => {
              initialHistory[month] = false;
            });
            setPaymentHistory(initialHistory);
          }
        })
        .catch(err => {
          console.error("Erro ao buscar dados de pagamento:", err);
        });
    }
  }, [isOpen, studentId, monthList]);

  // Handler para alterar o checkbox de um mês
  const handleCheckboxChange = (month: string) => {
    setPaymentHistory(prev => ({ ...prev, [month]: !prev[month] }));
  };

  // Handler para salvar os dados no modal
  const handleSave = () => {
    if (!enrollmentDate || enrollmentFee <= 0 || dueDay <= 0) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    const paymentData: PaymentData = {
      enrollmentDate,
      enrollmentFee,
      dueDay,
      history: paymentHistory,
    };
    console.log('Salvando PaymentData:', paymentData);
    onSave(studentId, paymentData);
    onClose();
  };
  

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalTop}>
        <p className={styles.tittle}>
            <span>Atualizar Pagamento</span>
          </p>
          <p><strong>Mês Atual:</strong> {getCurrentMonth()}</p>
          <div className={styles.inputGroup}>
            <label>Data da Matrícula:</label>
            <input
              type="date"
              value={enrollmentDate}
              onChange={(e) => setEnrollmentDate(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Preço da Matrícula:</label>
            <input
              type="number"
              value={enrollmentFee}
              onChange={(e) => setEnrollmentFee(parseFloat(e.target.value))}
              placeholder="Informe o valor"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Dia de Vencimento:</label>
            <input
              type="number"
              value={dueDay}
              onChange={(e) => setDueDay(parseInt(e.target.value))}
              placeholder="Ex: 10"
            />
          </div>
        </div>
        <div className={styles.modalBottom}>
        <p className={styles.historic}>
            <span>Histórico de Pagamentos</span>
          </p>
          <p className={styles.legend}>
            <span>✅: Pago</span> | <span>❗: Atrasado</span> | <span>ℹ️: Informação faltando</span>
          </p>
          <ul className={styles.monthList}>
            {monthList.map((month) => (
              <li key={month} className={styles.monthItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={paymentHistory[month] || false}
                    onChange={() => handleCheckboxChange(month)}
                  />
                  {month}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.modalActions}>
          <button onClick={handleSave} className={styles.saveButton}>Salvar</button>
          <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
