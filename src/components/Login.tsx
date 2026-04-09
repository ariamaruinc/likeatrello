import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { KanbanSquare } from 'lucide-react';
import { auth } from '../lib/firebase';
import styles from './Login.module.css';

export const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に登録されています。');
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードは6文字以上で入力してください。');
      } else {
        setError('エラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <KanbanSquare size={40} className={styles.logoIcon} />
          <span className={styles.logoText}>管理くん</span>
        </div>
        
        <h2 className={styles.title}>
          {isLoginView ? 'おかえりなさい' : 'アカウントを作成'}
        </h2>

        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>メールアドレス</label>
            <input 
              type="email" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>パスワード</label>
            <input 
              type="password" 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              required 
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : (isLoginView ? 'ログイン' : 'サインアップ')}
          </button>
        </form>

        <div className={styles.toggleMode}>
          {isLoginView ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
          <button 
            type="button" 
            className={styles.toggleLink}
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError(null);
            }}
          >
            {isLoginView ? '新規登録' : 'ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
};
