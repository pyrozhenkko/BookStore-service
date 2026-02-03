import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../services/authService';

function getTokenFromHash(): string | null {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  return params.get('token');
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = getTokenFromHash();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Паролі не збігаються');
      return;
    }
    if (password.length < 6) {
      setError('Пароль має містити щонайменше 6 символів');
      return;
    }
    if (!token) {
      setError('Недійсне посилання. Запитайте новий лист для скидання пароля.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setMessage('Пароль успішно змінено. Тепер ви можете увійти.');
      setTimeout(() => (window.location.hash = '#/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка скидання');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Недійсне посилання</CardTitle>
            <CardDescription>
              Посилання для скидання пароля недійсне або прострочене. Запитайте новий лист.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.hash = '#/forgot-password')}>
              Запитати новий лист
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Новий пароль</CardTitle>
          <CardDescription>
            Введіть новий пароль для вашого акаунту
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Новий пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Підтвердіть пароль</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Збереження...' : 'Змінити пароль'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
