import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
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
        <h1 className="text-3xl font-semibold mb-2">{t('profile.title')}</h1>
        <p className="text-gray-600">{t('profile.description')}</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5" />
            {t('profile.personalInfo.title')}
          </CardTitle>
          <CardDescription>
            {t('profile.personalInfo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('profile.personalInfo.name')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('profile.personalInfo.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {t('profile.personalInfo.saved')}
            </div>
          )}

          <Button onClick={handleSave}>
            {t('profile.personalInfo.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Cashback for Customers */}
      {isCustomer && balance !== null && balance !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">{t('profile.cashback.title')}</CardTitle>
            <CardDescription>{t('profile.cashback.description')}</CardDescription>
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
            {t('profile.accountInfo.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('profile.accountInfo.role')}</p>
              <Badge variant={currentUser.role === 'admin' ? 'destructive' : currentUser.role === 'employee' ? 'default' : 'secondary'} className="mt-1">
                {currentUser.role === 'admin'
                  ? t('profile.accountInfo.roles.admin')
                  : currentUser.role === 'employee'
                    ? t('profile.accountInfo.roles.employee')
                    : t('profile.accountInfo.roles.customer')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('profile.accountInfo.status')}</p>
              <Badge variant={currentUser.isBlocked ? 'destructive' : 'default'} className="mt-1">
                {currentUser.isBlocked ? t('profile.accountInfo.statuses.blocked') : t('profile.accountInfo.statuses.active')}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-semibold">{t('profile.accountInfo.accountEmail')}</p>
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
              {t('profile.dangerZone.title')}
            </CardTitle>
            <CardDescription>
              {t('profile.dangerZone.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  {t('profile.dangerZone.deleteBtn')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('profile.dangerZone.confirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('profile.dangerZone.confirmText')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('profile.dangerZone.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {t('profile.dangerZone.confirm')}
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
          <CardTitle>{t('profile.permissions.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentUser.role === 'customer' ? (
              <>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.viewCatalog')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.addToCart')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.checkout')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.viewHistory')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.editProfile')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.deleteAccount')}</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">{t('profile.permissions.manageBooks')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">{t('profile.permissions.confirmOrders')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">{t('profile.permissions.viewAllOrders')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">{t('profile.permissions.manageClients')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-blue-600" />
                  <p className="text-sm">{t('profile.permissions.viewAllClients')}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-1 size-2 rounded-full bg-green-600" />
                  <p className="text-sm">{t('profile.permissions.viewCatalog')}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
