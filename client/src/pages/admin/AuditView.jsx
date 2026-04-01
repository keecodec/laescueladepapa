import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../api';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import { staggerContainer, staggerItem } from '../../lib/animations';

function getEventBadge(action) {
  if (action === 'LOGIN_SUCCESS') {
    return (
      <Badge variant="success">
        <ShieldCheck size={12} />
        {action}
      </Badge>
    );
  }
  if (action === 'LOGIN_FAILED') {
    return (
      <Badge variant="error">
        <ShieldAlert size={12} />
        {action}
      </Badge>
    );
  }
  if (action === 'LOGOUT') {
    return (
      <Badge variant="default">
        <LogOut size={12} />
        {action}
      </Badge>
    );
  }
  if (action?.includes('USER_CREATED')) {
    return (
      <Badge variant="info">
        <UserCheck size={12} />
        {action}
      </Badge>
    );
  }
  if (action === 'USER_DELETED') {
    return (
      <Badge variant="error">
        <AlertTriangle size={12} />
        {action}
      </Badge>
    );
  }
  // Default: warning style for RBAC or unknown events
  return (
    <Badge variant="warning">
      <AlertTriangle size={12} />
      {action}
    </Badge>
  );
}

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit');
        setLogs(res.data);
      } catch {
        toast.error("Probleme d'acces a l'API d'audit.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      render: (val) => (
        <span className="font-mono text-xs text-text-muted">#{val}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date & Heure',
      render: (val) => <span className="text-text whitespace-nowrap">{val}</span>,
    },
    {
      key: 'user_id',
      label: 'Initiateur',
      render: (val) =>
        val !== 'N/A' ? (
          <span className="font-medium text-text-secondary">u_{val}</span>
        ) : (
          <span className="text-text-muted">Systeme / Anonyme</span>
        ),
    },
    {
      key: 'username_attempt',
      label: 'Cible',
      render: (val, row) => (
        <span
          className={`font-bold ${
            row.action === 'LOGIN_FAILED' ? 'text-error' : 'text-accent'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Evenement',
      render: (val) => getEventBadge(val),
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (val) => (
        <span className="font-mono text-xs text-text-muted">{val}</span>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      <PageHeader
        icon={Shield}
        title="Securite & Traces d'Audit"
        subtitle="Tracabilite reseau et monitoring des evenements d'authentification"
        accentColor="#FF3B30"
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            emptyMessage="Aucun log d'audit enregistre."
            compact
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
