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
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

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
      const payload = {
        displayName: form.displayName,
        username: form.username,
      };

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const { data } = await updateMyProfile(payload);
      setUser(data);
      setForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
      }));
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
        </form>
      </div>
    </AppShell>
  );
}
