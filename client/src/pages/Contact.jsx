import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Mail, Camera, MessageCircle, Phone, ArrowRight, ExternalLink } from 'lucide-react';

const Contact = () => {
  const contacts = [
    {
      title: 'General Inquiries',
      value: 'learn.microx@gmail.com',
      link: 'mailto:learn.microx@gmail.com',
      icon: Mail,
      color: 'bg-blue-500/10 text-blue-400'
    },
    {
      title: 'Technical Support',
      value: 'support.microx@gmail.com',
      link: 'mailto:support.microx@gmail.com',
      icon: MessageCircle,
      color: 'bg-purple-500/10 text-purple-400'
    },
    {
      title: 'Instagram',
      value: '@microx.learn',
      link: 'https://instagram.com/microx.learn',
      icon: Camera,
      color: 'bg-pink-500/10 text-pink-400'
    },
    {
      title: 'WhatsApp Support',
      value: '+91 9745275209',
      link: 'https://wa.me/919745275209',
      icon: Phone,
      color: 'bg-green-500/10 text-green-400'
    }
  ];

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-24 md:pt-48">
        <header className="max-w-3xl mb-12 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-6"
          >
            Connect with us
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]"
          >
            WE'RE HERE <br /> <span className="text-white/20 text-3xl md:text-7xl">TO HELP YOU GROW.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-sm md:text-xl max-w-xl leading-relaxed"
          >
            Have questions about materials, payments, or just want to say hi? Reach out to our team across any of these platforms.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {contacts.map((item, idx) => (
            <motion.a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="glass p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/10 group hover:bg-white/5 transition-all flex flex-col justify-between h-[180px] md:h-[320px]"
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-3xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} className="md:w-7 md:h-7" />
                </div>
                <ExternalLink className="text-white/10 group-hover:text-white transition-all" size={16} />
              </div>
              
              <div>
                <span className="text-[8px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-1 block">
                  {item.title}
                </span>
                <h3 className="text-lg md:text-4xl font-black tracking-tighter group-hover:translate-x-2 transition-transform truncate">
                  {item.value}
                </h3>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-8 md:p-24 glass rounded-[2.5rem] md:rounded-[5rem] border border-white/10 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl md:text-6xl font-bold mb-6 tracking-tighter italic">"Empowering the next generation of scholars."</h2>
            <p className="text-white/20 text-[9px] md:text-sm uppercase tracking-[0.3em] font-bold">MICROX ECOSYSTEM SUPPORT TEAM</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
