// src/components/PaymentBell.tsx
import React from 'react';
import styles from '../styles/PaymentBell.module.css';

export interface PaymentData {
  enrollmentDate: string;         
  enrollmentFee: number;          // Preço da matrícula
  dueDay: number;                 // Dia de vencimento, definido pelo professor
  history: Record<string, boolean>; // Histórico de pagamentos (chave: "YYYY-MM", valor: true se pago)
}

export interface PaymentBellProps {
  paymentData?: PaymentData; // Pode ser indefinido se o aluno ainda não tiver dados salvos
  currentMonth: string;
}

/**
 * Retorna um objeto com o ícone, a mensagem e uma classe de estilo
 * conforme o status do pagamento para o mês atual.
 * Se os dados não estiverem disponíveis, retorna null para não exibir nada.
 */
const getPaymentMessage = (
  data: PaymentData | undefined,
  currentMonth: string
): { icon: string; message: string; className: string } | null => {
  const today = new Date();
  if (!data || data.history[currentMonth] === undefined) {
    return null;
  }
  if (data.history[currentMonth] === true) {
    return { icon: '✅', message: `Mensalidade ${currentMonth} paga`, className: styles.paid };
  } else {
    if (today.getDate() > data.dueDay) {
      return { icon: '❗', message: `Mensalidade atrasada`, className: styles.late };
    }
    return { icon: '💰', message: `Mensalidade ${currentMonth} ainda não paga`, className: styles.pending };
  }
};

const PaymentBell: React.FC<PaymentBellProps> = ({ paymentData, currentMonth }) => {
  const paymentInfo = getPaymentMessage(paymentData, currentMonth);
  if (!paymentInfo) return null; // Se não houver informações, não renderiza nada

  return (
    <div className={`${styles.paymentBellContainer} ${paymentInfo.className}`} title="Status do Pagamento">
      <span className={styles.icon}>{paymentInfo.icon}</span>
      <span className={styles.text}>{paymentInfo.message}</span>
    </div>
  );
};

export default PaymentBell;
