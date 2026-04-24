import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';
import { getMyProfile, updateMyProfile } from '../services/userService';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    currentPassword: '',
    newPassword: '',
  });
  const [editOpen, setEditOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  const avatarSrc = user?.avatar_url ? `${apiBase}${user.avatar_url}` : null;
  const initials = user?.display_name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    getMyProfile()
      .then(({ data }) => {
        setForm((prev) => ({
          ...prev,
          displayName: data.display_name || '',
          username: data.username || '',
        }));
      })
      .catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaved('');
    setError('');

    try {
      const payload = new FormData();
      payload.append('displayName', form.displayName);
      payload.append('username', form.username);

      if (form.newPassword) {
        payload.append('currentPassword', form.currentPassword);
        payload.append('newPassword', form.newPassword);
      }

      if (avatarFile) payload.append('avatar', avatarFile);

      const { data } = await updateMyProfile(payload);
      setUser(data);
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
      setAvatarFile(null);
      setSaved('Profile updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update profile');
    }
  };

  return (
    <AppShell>
      <PageHeader title="Profile" subtitle="Update your account details and sign out securely" />
      <div className="control-list">
        <form className="card stack" onSubmit={submit}>
          <button type="button" className="profile-overview" onClick={() => setEditOpen((value) => !value)}>
            <div className="profile-overview-avatar-wrap">
              {avatarSrc ? (
                <img className="profile-overview-avatar" src={avatarSrc} alt={user?.display_name || 'Profile'} />
              ) : (
                <div className="profile-overview-avatar-fallback">{initials || 'U'}</div>
              )}
              <label className="profile-avatar-trigger" onClick={(event) => event.stopPropagation()}>
                <span className="material-symbols-outlined" aria-hidden="true">photo_camera</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <div className="profile-overview-copy">
              <div className="control-card-title">{user?.display_name || 'Profile'}</div>
              <div className="helper-text">{user?.role || 'user'}</div>
              <div className="profile-overview-hint">
                Tap to {editOpen ? 'hide' : 'edit'} profile details
                {avatarFile ? ' · New photo selected' : ''}
              </div>
            </div>
            <span className="material-symbols-outlined profile-overview-chevron" aria-hidden="true">
              {editOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {editOpen ? (
            <>
          <div className="control-card-grid">
            <div>
              <label className="form-label">Display Name</label>
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </div>
          <div className="control-card-grid">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                placeholder={form.newPassword ? 'Required to change password' : 'Leave empty to keep current password'}
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                placeholder="Leave empty to keep current password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="control-card-grid">
            <div>
              <div className="helper-text">Role</div>
              <div>{user?.role || '—'}</div>
            </div>
          </div>
          {saved ? <div className="success-text">{saved}</div> : null}
          {error ? <div className="error-text">{error}</div> : null}
          <div className="control-card-footer">
            <button className="btn btn-primary" type="submit">Save Profile</button>
            <button className="btn btn-danger" type="button" onClick={logout}>Logout</button>
          </div>
            </>
          ) : (
            <div className="control-card-footer">
              <button className="btn btn-ghost" type="button" onClick={() => setEditOpen(true)}>Edit Profile</button>
              <button className="btn btn-danger" type="button" onClick={logout}>Logout</button>
            </div>
          )}
        </form>
      </div>
    </AppShell>
  );
}
