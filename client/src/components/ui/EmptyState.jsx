import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { fadeInUp } from '../../lib/animations';

export default function EmptyState({ icon: Icon = Inbox, title, message, children }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F2F2F7] flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-muted" />
      </div>
      {title && <h3 className="text-base font-semibold text-text mb-1">{title}</h3>}
      {message && <p className="text-sm text-text-muted max-w-sm">{message}</p>}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
