export const roleConfig = {
  student: {
    label: 'Etudiant',
    color: '#007AFF',
    colorLight: '#409CFF',
    colorDark: '#0062CC',
    bg: '#EBF3FF',
    gradient: 'linear-gradient(135deg, #007AFF, #409CFF)',
    icon: 'GraduationCap',
  },
  professor: {
    label: 'Professeur',
    color: '#5856D6',
    colorLight: '#7A78E8',
    colorDark: '#4240B0',
    bg: '#F0F0FF',
    gradient: 'linear-gradient(135deg, #5856D6, #7A78E8)',
    icon: 'BookOpen',
  },
  staff: {
    label: 'Vie Scolaire',
    color: '#FF9500',
    colorLight: '#FFB340',
    colorDark: '#CC7700',
    bg: '#FFF5E6',
    gradient: 'linear-gradient(135deg, #FF9500, #FFB340)',
    icon: 'Shield',
  },
  admin: {
    label: 'Administrateur',
    color: '#FF3B30',
    colorLight: '#FF6259',
    colorDark: '#CC2F26',
    bg: '#FFF0EF',
    gradient: 'linear-gradient(135deg, #FF3B30, #FF6259)',
    icon: 'Crown',
  },
};

export function getRoleColor(role) {
  return roleConfig[role]?.color ?? '#007AFF';
}

export function getRoleGradient(role) {
  return roleConfig[role]?.gradient ?? roleConfig.student.gradient;
}

export function getRoleGlow(role) {
  return roleConfig[role]?.bg ?? '#EBF3FF';
}

export function getGradeColor(grade) {
  if (grade >= 16) return '#34C759';
  if (grade >= 14) return '#30D158';
  if (grade >= 12) return '#007AFF';
  if (grade >= 10) return '#FF9500';
  if (grade >= 8) return '#FF6B00';
  return '#FF3B30';
}

export function getGradeLabel(grade) {
  if (grade >= 16) return 'Excellent';
  if (grade >= 14) return 'Tres Bien';
  if (grade >= 12) return 'Bien';
  if (grade >= 10) return 'Assez Bien';
  if (grade >= 8) return 'Insuffisant';
  return 'Tres Insuffisant';
}

export const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const subjectColors = [
  '#007AFF', '#34C759', '#FF9500', '#AF52DE',
  '#FF2D55', '#5856D6', '#5AC8FA', '#FF3B30',
  '#FFCC00', '#30D158',
];

export function getSubjectColor(index) {
  return subjectColors[index % subjectColors.length];
}
