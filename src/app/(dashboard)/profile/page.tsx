'use client';

import { Spinner } from '@components/Spinner';
import { WritingStats } from '@components/WritingStats';
import { useAuth } from '@shared/providers/AuthProvider';
import { apiClient } from '@shared/services/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart2, CheckCircle, LogOut, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

async function fetchProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: { user: UserProfile };
  }>('/user/profile');
  return data.data.user;
}

export default function ProfilePage(): React.JSX.Element {
  const router = useRouter();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Champs formulaire profil
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      await apiClient.put('/user/profile', payload);
    },
    onSuccess: () => {
      setFormError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Profil mis à jour avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Erreur lors de la mise à jour';
      setFormError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete('/user/profile', {
        data: { password: deletePassword },
      });
    },
    onSuccess: () => {
      logout();
      router.push('/');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Erreur lors de la suppression';
      setDeleteError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setFormError('');

    if (newPassword && newPassword !== confirmPassword) {
      setFormError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const payload: Record<string, string> = {};
    if (name !== (profile?.name ?? '')) payload.name = name;
    if (email !== profile?.email) payload.email = email;
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) return;
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ai-primary/10 text-ai-primary">
          <User size={20} />
        </div>
        <div>
          <h1 className="font-writing text-2xl font-bold text-parchment-text">
            Mon compte
          </h1>
          {profile && (
            <p className="font-interface text-xs text-neutral-textSecondary">
              Membre depuis le{' '}
              {format(new Date(profile.createdAt), 'dd MMMM yyyy', {
                locale: fr,
              })}
            </p>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6 flex gap-1 rounded-lg border border-parchment-border bg-parchment-border/10 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`font-interface flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-white text-parchment-text shadow-sm'
              : 'text-neutral-textSecondary hover:text-parchment-text'
          }`}
        >
          <User size={15} />
          Profil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`font-interface flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            activeTab === 'stats'
              ? 'bg-white text-parchment-text shadow-sm'
              : 'text-neutral-textSecondary hover:text-parchment-text'
          }`}
        >
          <BarChart2 size={15} />
          Stats
        </button>
      </div>

      {/* Onglet Stats */}
      {activeTab === 'stats' && (
        <div>
          <WritingStats />
        </div>
      )}

      {/* Onglet Profil */}
      {activeTab === 'profile' && (
        <>
          <form
            onSubmit={handleSubmit}
            className="scroll-parchment space-y-5 rounded-xl p-6"
          >
            <h2 className="font-interface text-sm font-semibold uppercase tracking-wide text-neutral-textSecondary">
              Informations personnelles
            </h2>

            <div>
              <label
                className="font-interface block text-sm font-medium text-parchment-text"
                htmlFor="profile-name"
              >
                Nom d&apos;affichage
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="font-writing mt-1 w-full rounded-lg border border-parchment-border bg-parchment-editor px-3 py-2 text-sm text-parchment-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
              />
            </div>

            <div>
              <label
                className="font-interface block text-sm font-medium text-parchment-text"
                htmlFor="profile-email"
              >
                Email
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-writing mt-1 w-full rounded-lg border border-parchment-border bg-parchment-editor px-3 py-2 text-sm text-parchment-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
              />
            </div>

            <hr className="border-parchment-border/60" />

            <h2 className="font-interface text-sm font-semibold uppercase tracking-wide text-neutral-textSecondary">
              Changer de mot de passe
            </h2>

            <div>
              <label
                className="font-interface block text-sm font-medium text-parchment-text"
                htmlFor="current-password"
              >
                Mot de passe actuel
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="font-writing mt-1 w-full rounded-lg border border-parchment-border bg-parchment-editor px-3 py-2 text-sm text-parchment-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="font-interface block text-sm font-medium text-parchment-text"
                  htmlFor="new-password"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="font-writing mt-1 w-full rounded-lg border border-parchment-border bg-parchment-editor px-3 py-2 text-sm text-parchment-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
                />
              </div>
              <div>
                <label
                  className="font-interface block text-sm font-medium text-parchment-text"
                  htmlFor="confirm-password"
                >
                  Confirmer
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="font-writing mt-1 w-full rounded-lg border border-parchment-border bg-parchment-editor px-3 py-2 text-sm text-parchment-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
                />
              </div>
            </div>

            {formError && (
              <p className="font-interface text-sm text-action-error">
                {formError}
              </p>
            )}
            {successMessage && (
              <p className="font-interface flex items-center gap-1.5 text-sm text-action-success">
                <CheckCircle size={14} />
                {successMessage}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="font-interface flex items-center gap-2 rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? <Spinner size="sm" /> : null}
                Enregistrer
              </button>
            </div>
          </form>

          {/* Zone danger */}
          <div className="mt-8 rounded-xl border border-action-error/30 bg-action-error/5 p-6">
            <h2 className="font-interface text-sm font-semibold uppercase tracking-wide text-action-error">
              Zone dangereuse
            </h2>
            <p className="font-interface mt-2 text-sm text-neutral-textSecondary">
              La suppression de votre compte est définitive et irréversible.
              Toutes vos données (documents, livres, analyses, conversations)
              seront supprimées conformément au RGPD.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="font-interface flex items-center gap-2 rounded-lg border border-neutral-border bg-white px-4 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg"
              >
                <LogOut size={15} />
                Se déconnecter
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError('');
                  setShowDeleteConfirm(true);
                }}
                className="font-interface flex items-center gap-2 rounded-lg border border-action-error bg-white px-4 py-2 text-sm font-medium text-action-error transition-all hover:bg-action-error/10"
              >
                <Trash2 size={15} />
                Supprimer mon compte
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dialog suppression compte */}
      {showDeleteConfirm &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="font-interface w-full max-w-md rounded-xl border border-neutral-border bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-neutral-text">
                Supprimer votre compte ?
              </h3>
              <p className="mt-2 text-sm text-neutral-textSecondary">
                Cette action est <strong>irréversible</strong>. Toutes vos
                données seront supprimées définitivement. Entrez votre mot de
                passe pour confirmer.
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoFocus
                className="mt-4 w-full rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-action-error"
              />
              {deleteError && (
                <p className="mt-2 text-xs text-action-error">{deleteError}</p>
              )}
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="rounded-md border border-neutral-border px-4 py-2 text-sm font-medium text-neutral-text hover:bg-neutral-bg"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!deletePassword || deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                  className="rounded-md bg-action-error px-4 py-2 text-sm font-semibold text-white hover:bg-action-error/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteMutation.isPending
                    ? 'Suppression...'
                    : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </div>,
          globalThis.document.body
        )}
    </div>
  );
}
