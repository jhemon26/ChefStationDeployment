import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { createInviteCode, deleteInviteCode, listInviteCodes } from '../services/inviteCodeService';
import { formatDateTime } from '../utils/formatters';
import { sortAlpha } from '../utils/sortHelpers';
import { confirmAction } from '../utils/confirmAction';

export default function OwnerCodesPage() {
  const [rows, setRows] = useState([]);
  const [latest, setLatest] = useState('');

  const load = async () => {
    const { data } = await listInviteCodes();
    setRows(sortAlpha(data, (item) => item.code));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const generate = async () => {
    const { data } = await createInviteCode();
    setLatest(data.code);
    load();
  };

  return (
    <AppShell>
      <PageHeader title="Invite Codes" subtitle="48-hour staff onboarding codes" actions={<button className="btn btn-primary" type="button" onClick={generate}>Generate New Code</button>} />
      {latest ? <div className="card" style={{ font: '800 2rem var(--font-display)', color: 'var(--green)', letterSpacing: 4 }}>{latest}</div> : null}
      <div style={{ height: 16 }} />
      <div className="card">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>Code</th><th>Status</th><th>Used By</th><th>Expires</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = row.is_used ? 'Used' : new Date(row.expires_at) < new Date() ? 'Expired' : 'Available';
                return (
                  <tr key={row.id}>
                    <td>{row.code}</td>
                    <td>{status}</td>
                    <td>{row.used_by_name || 'N/A'}</td>
                    <td>{formatDateTime(row.expires_at)}</td>
                    <td>{status === 'Available' ? <button type="button" className="btn btn-danger" onClick={async () => {
                      if (!(await confirmAction(`Revoke invite code ${row.code}?`, { title: 'Warning', confirmLabel: 'Revoke Code' }))) return;
                      deleteInviteCode(row.id).then(load);
                    }}>Revoke</button> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
