import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../../api';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Input, { Select, Textarea } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { fadeInUp } from '../../lib/animations';
import {
  FileText,
  Calendar,
  Send,
  BookOpenCheck,
  Layers,
} from 'lucide-react';

const ACCENT = '#34C759';

export default function ProfHomework() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    assignment_id: '',
    date_due: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/professor/classes')
      .then((res) => {
        setClasses(res.data);
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, assignment_id: res.data[0].assignment_id }));
        }
      })
      .catch(() => toast.error('Impossible de charger vos classes.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/professor/homework', form);
      toast.success(res.data.message || 'Devoir publie avec succes.');
      setForm((f) => ({ ...f, content: '' }));
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon={FileText}
        title="Cahier de Textes"
        subtitle="Programmation du travail a faire"
        accentColor={ACCENT}
      />

      {classes.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Aucune classe"
          message="Vous n'avez pas encore de classe assignee. Contactez l'administration."
        />
      ) : (
        <motion.div
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={{ ...fadeInUp.transition, delay: 0.1 }}
        >
          <GlassCard hover={false}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Class selector */}
              <Select
                label="Classe ciblee"
                value={form.assignment_id}
                onChange={(e) =>
                  setForm({ ...form, assignment_id: e.target.value })
                }
                required
              >
                {classes.map((c) => (
                  <option key={c.assignment_id} value={c.assignment_id}>
                    {c.name} ({c.subject})
                  </option>
                ))}
              </Select>

              {/* Due date */}
              <Input
                label="Date d'echeance"
                type="date"
                icon={Calendar}
                value={form.date_due}
                onChange={(e) =>
                  setForm({ ...form, date_due: e.target.value })
                }
                required
              />

              {/* Content */}
              <Textarea
                label="Contenu de la seance et travail a accomplir"
                rows={8}
                placeholder="Ex: Faire les exercices 1 a 4 page 122. Reviser le chapitre 3 en vue d'une evaluation continue..."
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                required
              />

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                icon={submitting ? undefined : Send}
                loading={submitting}
                className="mt-2 w-full"
                style={{
                  background: ACCENT,
                }}
              >
                Publier sur le Cahier de Textes
              </Button>
            </form>
          </GlassCard>

          {/* Quick info card */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard hover={false} padding="p-4">
              <div className="flex items-center gap-3 text-text-muted text-sm">
                <BookOpenCheck
                  size={18}
                  className="shrink-0"
                  style={{ color: ACCENT }}
                />
                <span>
                  Les devoirs publies seront immediatement visibles par les
                  eleves et les parents de la classe selectionnee.
                </span>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
