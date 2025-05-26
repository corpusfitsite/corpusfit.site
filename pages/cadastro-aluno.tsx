import React, { useState, useEffect } from 'react';
import styles from '../styles/Professor.module.css';
import { useRouter } from 'next/router';

const CadastroAlunoPublico: React.FC = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCPF] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (name.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const gerarSugestoes = async () => {
      const [firstName, lastName = ''] = name.trim().split(' ');
      const formatos = [
        `${firstName}${lastName ? `_${lastName}` : ''}@corpusfit`,
        `${firstName[0]}${lastName}@corpusfit`,
        `${firstName}${lastName ? `.${lastName}` : ''}@corpusfit`
      ];

      const disponiveis: string[] = [];

      for (const loginTest of formatos) {
        const res = await fetch(`/api/verificar-login?login=${loginTest}`);
        const data = await res.json();
        if (data.available) disponiveis.push(loginTest);
      }

      setSuggestions(disponiveis);
    };

    gerarSugestoes();
  }, [name]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('login', login);
    formData.append('password', password);
    if (cpf) formData.append('cpf', cpf);
    if (birthDate) formData.append('birth_date', birthDate);
    if (email) formData.append('email', email);
    if (telefone) formData.append('telefone', telefone);
    if (photo) formData.append('photo', photo);

    try {
      const res = await fetch('/api/alunos', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar aluno');

      alert('Cadastro enviado com sucesso! Aguarde a aprovação de um professor.');
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao cadastrar aluno');
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <form className={styles.addAlunoForm} onSubmit={handleSubmit}>
        <h3>Criar Conta de Aluno</h3>

        <input
          type="text"
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.inputField}
          required
        />

        <input
          type="text"
          placeholder="Login desejado"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className={styles.inputField}
          required
        />

        {/* Sugestões de login */}
        {suggestions.length > 0 && (
          <div className={styles.suggestionsContainer}>
            {suggestions.map((sugestao, i) => (
              <div
                key={i}
                className={styles.suggestionItem}
                onClick={() => {
                  setLogin(sugestao);
                  setSuggestions([]);
                }}
              >
                {sugestao}
              </div>
            ))}
          </div>
        )}

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputField}
          required
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCPF(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="date"
          placeholder="Data de nascimento"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className={styles.inputField}
        />
        <input
          type="file"
          accept="image/*"
          name="photo"
          className={styles.inputField}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setPhoto(e.target.files[0]);
            }
          }}
        />

        <button type="submit" className={styles.submitButton}>
          Enviar Cadastro
        </button>
      </form>
    </div>
  );
};

export default CadastroAlunoPublico;
