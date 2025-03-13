
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Dashboard from '../components/Dashboard';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow pt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Dashboard />
      </motion.main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
