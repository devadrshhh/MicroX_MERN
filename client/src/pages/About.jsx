import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { BookOpen, Target, Sparkles, ShieldCheck } from 'lucide-react';

const About = () => {
  const sections = [
    {
      title: 'Who We Are',
      icon: BookOpen,
      content: [
        'MicroX is an independent digital education platform created with the aim of supporting students through clear, structured, and meaningful learning resources. The platform is designed primarily for Higher Secondary and Undergraduate students who seek reliable academic guidance in a digital format.',
        'The idea behind MicroX originated from the observation that many students struggle not because of a lack of effort, but due to the absence of properly structured learning content. MicroX aims to provide a stable and dependable academic space.',
        'MicroX is built for students who value discipline in learning. Instead of overwhelming users with excessive content, the platform emphasizes focused explanations and purposeful study materials.'
      ]
    },
    {
      title: 'Our Purpose',
      icon: Target,
      content: [
        'The core purpose of MicroX is to simplify education without compromising academic quality. Learning should not feel complex or intimidating, and students should have access to resources that explain concepts in a clear and logical manner.',
        'MicroX aims to support students who prefer independent learning as well as those who need additional academic reinforcement. By providing structured notes and revision materials, the platform allows learners to study at their own pace.',
        'Beyond examinations, MicroX seeks to promote genuine understanding. The platform encourages learners to engage with subjects thoughtfully, developing conceptual clarity that supports long-term academic growth.'
      ]
    },
    {
      title: 'What MicroX Provides',
      icon: Sparkles,
      content: [
        'MicroX offers a wide range of academic resources designed to support different stages of education. The platform provides study materials for Plus One and Plus Two students across Science, Commerce, and Humanities streams, as well as Undergraduate learners.',
        'The study materials available on MicroX are written in simple language while maintaining academic accuracy. This structured presentation helps students grasp concepts without feeling overwhelmed, making learning more approachable.',
        'MicroX also offers microcopy PDFs, which are compact revision materials designed for quick review. These documents summarize important concepts and are especially useful during exam preparation.'
      ]
    },
    {
      title: 'Ethics & Trust',
      icon: ShieldCheck,
      content: [
        'MicroX is committed to maintaining ethical educational practices and academic integrity. All content is created solely for learning purposes and follows responsible educational standards.',
        'User trust is a fundamental value of MicroX. The platform prioritizes transparency, content quality, and user experience. Any advertisements displayed are managed responsibly to ensure they do not interfere with the learning environment.',
        'In conclusion, MicroX is more than a study material website. It is an educational initiative dedicated to making learning simpler, clearer, and more accessible.'
      ]
    }
  ];

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 md:pt-48">
        <header className="max-w-4xl mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-8"
          >
            Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            SIMPLIFYING <br /> <span className="text-white/20">THE PATH TO EXCELLENCE.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            MicroX is more than a platform—it's a commitment to clarity, structure, and the belief that every student deserves high-quality educational guidance.
          </motion.p>
        </header>

        <div className="space-y-24 md:space-y-40">
          {sections.map((section, idx) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start"
            >
              <div className="lg:col-span-4 sticky top-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                    <section.icon size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">{section.title}</h2>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="lg:col-span-8 space-y-8">
                {section.content.map((para, pIdx) => (
                  <p key={pIdx} className="text-white/60 text-base md:text-lg leading-relaxed font-medium">
                    {para}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-40 p-12 md:p-32 glass rounded-[3rem] md:rounded-[5rem] border border-white/10 text-center relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-bold mb-10 tracking-tighter italic max-w-4xl mx-auto">
              "The goal matters more than the path."
            </h2>
            <div className="flex flex-col items-center gap-2">
               <span className="text-white font-black tracking-tighter text-xl md:text-2xl">MICROX ECOSYSTEM</span>
               <p className="text-white/20 text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold">ESTABLISHED TO EMPOWER</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-[120px] rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
