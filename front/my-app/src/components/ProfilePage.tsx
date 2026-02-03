import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { User, Mail, Shield, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

export function ProfilePage() {
  const { currentUser, logout, isCustomer, balance } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would call an API to update user info
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    logout();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Профіль користувача</h1>
        <p className="text-gray-600">Управління вашим акаунтом та особистою інформацією</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            Особиста інформація
          </CardTitle>
          <CardDescription>
            Оновіть ваші особисті дані
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ім'я</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              ✓ Зміни успішно збережено!
            </div>
          )}

          <Button onClick={handleSave}>
            Зберегти зміни
          </Button>
        </CardContent>
      </Card>

      {/* Cashback for Customers */}
      {isCustomer && balance !== null && balance !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Кешбек</CardTitle>
            <CardDescription>Ваш поточний баланс кешбеку</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">{balance.toFixed(2)} ₴</p>
          </CardContent>
        </Card>
      )}

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Інформація про акаунт
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Роль</p>
              <Badge variant={currentUser.role === 'employee' ? 'default' : 'secondary'} className="mt-1">
                {currentUser.role === 'employee' ? 'Співробітник' : 'Покупець'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Статус</p>
              <Badge variant={currentUser.isBlocked ? 'destructive' : 'default'} className="mt-1">
                {currentUser.isBlocked ? 'Заблоковано' : 'Активний'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-semibold">Email акаунту</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="size-4" />
              <span>{currentUser.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Card - Only for Customers */}
      {currentUser.role === 'customer' && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="size-5" />
              Небезпечна зона
            </CardTitle>
            <CardDescription>
              Видалення акаунту є незворотною дією
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Видалити мій акаунт
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ця дія не може бути скасована. Це назавжди видалить ваш акаунт
                    та всі пов'язані з ним дані з наших серверів.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Скасувати</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Так, видалити акаунт
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Дозволи та можливості</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentUser.role === 'customer' ? (
              <>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Перегляд каталогу книг</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Додавання книг в кошик</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Оформлення замовлень</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Перегляд історії замовлень</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Редагування особистої інформації</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Видалення власного акаунту</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">Додавання, редагування та видалення книг</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">Підтвердження замовлень клієнтів</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">Перегляд всіх замовлень</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">Блокування/розблокування клієнтів</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">Перегляд списку всіх клієнтів</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">Перегляд каталогу книг</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
