import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMessage('Якщо акаунт існує, ви отримаєте лист з посиланням для скидання пароля.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка відправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Скидання пароля</CardTitle>
          <CardDescription>
            Введіть email вашого акаунту. Ми надішлемо вам посилання для скидання пароля.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Надсилання...' : 'Надіслати'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => (window.location.hash = '#/login')}
            >
              Назад до входу
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
