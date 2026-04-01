import { motion } from 'framer-motion';
import { pageTransition } from '../../lib/animations';

export default function PageTransition({ children, className }) {
  return (
    <motion.div
      className={className}
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
    >
      {children}
    </motion.div>
  );
}
