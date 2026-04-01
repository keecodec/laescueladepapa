import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { fetchCsrfToken } from '../../api';
import { Clock, Send, UserSearch } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import Input, { Select, Textarea, Checkbox } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { staggerContainer, staggerItem } from '../../lib/animations';

export default function StaffAbsences() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student_id: '',
    date: '',
    is_late: false,
    justified: false,
    comments: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/staff/students')
      .then((res) => {
        setStudents(res.data);
        if (res.data.length > 0)
          setForm((f) => ({ ...f, student_id: res.data[0].id }));
      })
      .catch(() => toast.error('Impossible de charger la liste des eleves.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchCsrfToken();
      const res = await api.post('/staff/absences', form);
      toast.success(res.data.message || 'Absence enregistree avec succes.');
      setForm({ ...form, is_late: false, justified: false, comments: '' });
    } catch (err) {
      toast.error('Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <PageHeader
        icon={Clock}
        title="Gestion des Incidents"
        subtitle="Espace Vie Scolaire -- Absences, retards et justificatifs"
        accentColor="#FF9500"
      />

      <motion.div variants={staggerItem}>
        <GlassCard hover={false}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Select
              label="Recherche Eleve"
              value={form.student_id}
              onChange={(e) =>
                setForm({ ...form, student_id: e.target.value })
              }
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.username} - ({s.class_name || 'Sans Classe'})
                </option>
              ))}
            </Select>

            <Input
              label="Date effective de l'incident"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />

            <div className="flex flex-wrap gap-8 bg-[rgba(0,0,0,0.03)] p-5 rounded-xl border border-[rgba(0,0,0,0.06)]">
              <Checkbox
                label="S'agit-il d'un Retard ?"
                checked={form.is_late}
                onChange={(e) =>
                  setForm({ ...form, is_late: e.target.checked })
                }
                color="#FF9500"
              />
              <Checkbox
                label="Incident formellement Justifie ?"
                checked={form.justified}
                onChange={(e) =>
                  setForm({ ...form, justified: e.target.checked })
                }
                color="#34C759"
              />
            </div>

            <Textarea
              label="Rapport du surveillant / CPE"
              rows={5}
              placeholder="Retard de 15 minutes, l'eleve a affirme que son bus est tombe en panne..."
              value={form.comments}
              onChange={(e) =>
                setForm({ ...form, comments: e.target.value })
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={Send}
              className="mt-2 bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-amber-500/40"
            >
              Inscrire au dossier disciplinaire
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
