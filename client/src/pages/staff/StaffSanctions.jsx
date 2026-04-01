import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../../api';
import { ShieldBan, FileWarning, Send } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Select, Textarea } from '../../components/ui/Input';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { staggerContainer, staggerItem } from '../../lib/animations';
import { formatDate } from '../../lib/utils';

const SANCTION_TYPES = ['Observation', 'Avertissement', 'Retenue', 'Exclusion'];

const SANCTION_COLORS = {
  Observation: '#60a5fa',
  Avertissement: '#FF9500',
  Retenue: '#f97316',
  Exclusion: '#FF3B30',
};

export default function StaffSanctions() {
  const [students, setStudents] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    type: SANCTION_TYPES[0],
    date: '',
    reason: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsResponse, sanctionsResponse] = await Promise.all([
          api.get('/staff/students'),
          api.get('/staff/sanctions'),
        ]);
        setStudents(studentsResponse.data);
        setSanctions(sanctionsResponse.data);
        if (studentsResponse.data.length > 0) {
          setForm((current) => ({
            ...current,
            student_id: String(studentsResponse.data[0].id),
          }));
        }
      } catch {
        toast.error('Impossible de charger le registre disciplinaire.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const response = await api.post('/staff/sanctions', form);
      toast.success(response.data.message || 'Sanction enregistree.');
      const sanctionsResponse = await api.get('/staff/sanctions');
      setSanctions(sanctionsResponse.data);
      setForm((current) => ({ ...current, reason: '', date: '' }));
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        icon={ShieldBan}
        title="Sanctions"
        subtitle="Registre disciplinaire de la vie scolaire"
        accentColor="#FF9500"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,420px)_1fr] gap-6">
        {/* Left column: Form */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <GlassCard hover={false}>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <Select
                  label="Eleve concerne"
                  value={form.student_id}
                  onChange={(e) =>
                    setForm({ ...form, student_id: e.target.value })
                  }
                  required
                >
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.username} ({student.class_name || 'Sans classe'})
                    </option>
                  ))}
                </Select>

                <Select
                  label="Type de sanction"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  required
                >
                  {SANCTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  required
                />

                <Textarea
                  label="Motif"
                  rows={6}
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                  placeholder="Ex: comportement perturbateur repete en classe..."
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  icon={Send}
                  className="mt-1 bg-gradient-to-r from-orange-500 to-red-600 shadow-orange-500/25 hover:shadow-orange-500/40"
                >
                  Ajouter au dossier disciplinaire
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>

        {/* Right column: Recent sanctions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileWarning size={20} className="text-pink-500" />
            <h2 className="text-lg font-bold text-text">Historique recent</h2>
            <span className="text-sm text-text-muted ml-1">
              ({sanctions.length} sanctions)
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sanctions.length === 0 ? (
            <GlassCard hover={false}>
              <EmptyState
                icon={FileWarning}
                title="Aucune sanction"
                message="Aucune sanction enregistree pour le moment."
              />
            </GlassCard>
          ) : (
            <motion.div
              className="flex flex-col gap-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {sanctions.map((sanction) => (
                <motion.div key={sanction.id} variants={staggerItem}>
                  <GlassCard padding="p-4" className="flex gap-4">
                    <div className="shrink-0">
                      <Badge color={SANCTION_COLORS[sanction.type] || '#FF9500'}>
                        {sanction.type}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold text-text text-sm">
                          {sanction.student_username}
                        </span>
                        <span className="text-xs text-text-muted">
                          {sanction.class_name || 'Sans classe'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                        {sanction.reason}
                      </p>
                      <p className="text-xs text-text-muted mt-2">
                        {sanction.date} -- saisi par {sanction.staff_username}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
