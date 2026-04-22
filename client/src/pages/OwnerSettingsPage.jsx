import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { getSettings, updateSettings } from '../services/settingsService';
import { useAuth } from '../hooks/useAuth';

export default function OwnerSettingsPage() {
  const { setRestaurant } = useAuth();
  const [form, setForm] = useState({ name: '', address: '', phone: '' });
  const [saved, setSaved] = useState('');

  useEffect(() => {
    getSettings().then(({ data }) => setForm({ name: data.name || '', address: data.address || '', phone: data.phone || '' })).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const { data } = await updateSettings(form);
    setRestaurant(data);
    setSaved('Saved');
  };

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Restaurant details and contact info" />
      <form className="card stack" onSubmit={submit}>
        <input placeholder="Restaurant name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {saved ? <div className="success-text">{saved}</div> : null}
        <button className="btn btn-primary" type="submit">Save Changes</button>
      </form>
    </AppShell>
  );
}
