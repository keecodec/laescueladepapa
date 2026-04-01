import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../../api';
import {
  Users as UsersIcon,
  Plus,
  ShieldCheck,
  Trash2,
  Library,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input, { Select } from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { staggerContainer, staggerItem } from '../../lib/animations';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'student',
    class_id: '',
  });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

  const fetchData = async () => {
    try {
      const [uRes, cRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/classes'),
      ]);
      setUsers(uRes.data);
      setClassesList(cRes.data);
      if (cRes.data.length > 0) {
        setForm((f) => ({ ...f, class_id: f.class_id || cRes.data[0].id }));
      }
    } catch {
      toast.error('Acces refuse ou instabilite reseau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const payload = { ...form };
      if (payload.role !== 'student' && payload.role !== 'professor') {
        payload.class_id = null;
      }
      const res = await api.post('/admin/users', payload);
      toast.success(res.data.message || 'Utilisateur cree avec succes.');
      setForm({
        username: '',
        password: '',
        role: 'student',
        class_id: classesList.length > 0 ? classesList[0].id : '',
      });
      fetchData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    try {
      await fetchCsrfToken();
      const res = await api.delete(`/admin/users/${deleteModal.user.id}`);
      toast.success(res.data.message || 'Utilisateur supprime.');
      setDeleteModal({ open: false, user: null });
      fetchData();
    } catch (err) {
      toast.error('Une erreur est survenue.');
      setDeleteModal({ open: false, user: null });
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '70px',
      render: (val) => (
        <span className="text-text-muted font-mono text-xs">#{val}</span>
      ),
    },
    {
      key: 'username',
      label: 'Identifiant',
      render: (val) => <span className="font-bold">{val}</span>,
    },
    {
      key: 'classes',
      label: 'Classes',
      render: (val) =>
        val ? (
          <span className="text-text-secondary text-sm">{val}</span>
        ) : (
          <span className="text-text-muted text-sm opacity-50">
            Aucune assignation
          </span>
        ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <Badge variant={val}>{val}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModal({ open: true, user: row });
          }}
          className="text-error/70 hover:text-error hover:bg-error/10"
        >
          <Trash2 size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      <PageHeader
        icon={UsersIcon}
        title="Gestion des Utilisateurs"
        subtitle="Droits Administrateurs -- CRUD Avance"
        accentColor="#FF3B30"
      >
        <Badge variant="admin" pulse>
          <ShieldCheck size={12} /> Admin
        </Badge>
      </PageHeader>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-[minmax(350px,1fr)_2fr] gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Creation form */}
        <motion.div variants={staggerItem}>
          <GlassCard hover={false}>
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-5">
              <Plus size={20} className="text-success" />
              Ouvrir un compte
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Identifiant unique (login)"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                required
                placeholder="Ex: jean.dupont"
              />

              <Input
                label="Mot de passe (chiffre en DB)"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
                placeholder="Mot de passe fort"
              />

              <Select
                label="Role d'Environnement (RBAC)"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="student">Eleve</option>
                <option value="professor">Professeur</option>
                <option value="staff">Vie Scolaire / CPE</option>
                <option value="admin">Administrateur Systeme</option>
              </Select>

              {(form.role === 'student' || form.role === 'professor') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-success/5 border border-success/20"
                >
                  <Select
                    label="Affectation Academique initiale"
                    value={form.class_id}
                    onChange={(e) =>
                      setForm({ ...form, class_id: e.target.value })
                    }
                    required
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.level})
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-text-muted mt-2">
                    L'utilisateur sera inclus aux emplois du temps de cette
                    classe.
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="success"
                size="lg"
                loading={submitting}
                icon={Plus}
                className="mt-2"
              >
                Deployer l'utilisateur
              </Button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Users table */}
        <motion.div variants={staggerItem}>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="Aucun utilisateur dans la base."
          />
        </motion.div>
      </motion.div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        title="Confirmer la suppression"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-error/10 border border-error/20">
            <AlertTriangle size={20} className="text-error shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text font-semibold">
                Action irreversible
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Voulez-vous vraiment supprimer le compte{' '}
                <strong className="text-text">
                  {deleteModal.user?.username}
                </strong>{' '}
                ? Toutes ses donnees seront effacees (CASCADE).
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, user: null })}
            >
              Annuler
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete}>
              Supprimer definitivement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
