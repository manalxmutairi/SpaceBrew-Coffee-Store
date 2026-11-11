import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Bean, LoaderCircle, LogOut, Moon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type AccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
};

export default function AccountDialog({
  open,
  onOpenChange,
  user,
}: AccountDialogProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const form = useForm<{ email: string; password: string }>({
    defaultValues: { email: '', password: '' },
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      form.setValue('password', '');
      setNotice('');
      setErrorMessage('');
    }
  }, [open, form]);

  const changeMode = (nextMode: 'signup' | 'signin') => {
    setMode(nextMode);
    form.clearErrors();
    form.setValue('password', '');
    setNotice('');
    setErrorMessage('');
  };

  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    setBusy(true);
    setNotice('');
    setErrorMessage('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        form.setValue('password', '');
        if (!data.session) {
          setNotice('Check your inbox for a confirmation link to finish creating your account.');
        } else {
          onOpenChange(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        form.setValue('password', '');
        onOpenChange(false);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not complete that request. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setBusy(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not sign you out. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="account-dialog-content"
        data-testid="dialog-customer-account"
      >
        <div className="account-dialog-brand">
          <span className="account-dialog-mark"><Bean size={17} /></span>
          <span>COSMIC BEANS · CUSTOMER ACCOUNT</span>
        </div>

        {user ? (
          <div className="account-signed-in">
            <span className="account-signed-in-moon"><Moon size={21} /></span>
            <DialogHeader className="account-dialog-heading">
              <DialogTitle className="account-dialog-title">Welcome back.</DialogTitle>
              <DialogDescription className="account-dialog-description">
                You’re signed in to your little corner of the cosmos.
              </DialogDescription>
            </DialogHeader>
            <div className="account-email-card" data-testid="text-account-email">
              <span>ACCOUNT EMAIL</span>
              <strong>{user.email}</strong>
            </div>
            {errorMessage && <p className="account-error" role="alert">{errorMessage}</p>}
            <button
              type="button"
              className="account-submit account-signout"
              onClick={handleSignOut}
              disabled={busy}
              data-testid="button-account-signout"
            >
              {busy ? <LoaderCircle size={16} className="account-spinner" /> : <LogOut size={16} />}
              Sign out
            </button>
          </div>
        ) : (
          <>
            <DialogHeader className="account-dialog-heading">
              <DialogTitle className="account-dialog-title">
                {mode === 'signup' ? 'Join our little orbit.' : 'Welcome back.'}
              </DialogTitle>
              <DialogDescription className="account-dialog-description">
                {mode === 'signup'
                  ? 'Create an account for your Cosmic Beans visits.'
                  : 'Sign in to your Cosmic Beans account.'}
              </DialogDescription>
            </DialogHeader>

            <div className="account-mode-switch" aria-label="Account action">
              <button
                type="button"
                className={mode === 'signup' ? 'is-selected' : ''}
                aria-pressed={mode === 'signup'}
                onClick={() => changeMode('signup')}
                data-testid="button-account-create-mode"
              >
                Create account
              </button>
              <button
                type="button"
                className={mode === 'signin' ? 'is-selected' : ''}
                aria-pressed={mode === 'signin'}
                onClick={() => changeMode('signin')}
                data-testid="button-account-signin-mode"
              >
                Sign in
              </button>
            </div>

            <Form {...form}>
            <form className="account-form" onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField control={form.control} name="email" rules={{ required: 'Enter your email address.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' } }} render={({ field }) => (
                <FormItem className="account-field">
                  <FormLabel>Email address</FormLabel>
                  <FormControl><input {...field} type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com" disabled={busy} data-testid="input-account-email" /></FormControl>
                  <FormMessage className="account-field-error" />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" rules={{ required: 'Enter your password.', minLength: { value: mode === 'signup' ? 8 : 1, message: 'Use at least 8 characters.' } }} render={({ field }) => (
                <FormItem className="account-field">
                  <FormLabel>Password</FormLabel>
                  <FormControl><input {...field} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : 1} required placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} disabled={busy} data-testid="input-account-password" /></FormControl>
                  <FormMessage className="account-field-error" />
                </FormItem>
              )} />
              {notice && <p className="account-notice" role="status" data-testid="status-account-notice">{notice}</p>}
              {errorMessage && <p className="account-error" role="alert">{errorMessage}</p>}
              <button
                type="submit"
                className="account-submit"
                disabled={busy}
                data-testid="button-account-submit"
              >
                {busy ? (
                  <><LoaderCircle size={16} className="account-spinner" /> One moment…</>
                ) : (
                  <>{mode === 'signup' ? 'Create my account' : 'Sign in'} <ArrowRight size={16} /></>
                )}
              </button>
              <p className="account-footnote">
                Your password is handled securely by Supabase. Email confirmation may be required before your first sign-in.
              </p>
            </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
