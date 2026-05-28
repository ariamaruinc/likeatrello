import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { KanbanSquare } from 'lucide-react';
import { auth } from '../lib/firebase';
import styles from './Login.module.css';

const provider = new GoogleAuthProvider();

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError('ログインに失敗しました。もう一度お試しください。');
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

        <h2 className={styles.title}>おかえりなさい</h2>

        {error && <div className={styles.errorText}>{error}</div>}

        <button
          className={styles.button}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? '処理中...' : 'Googleでログイン'}
        </button>
      </div>
    </div>
  );
};
