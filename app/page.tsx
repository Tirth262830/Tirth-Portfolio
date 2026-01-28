'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, type Variants } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  FileText,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

/* ---------------- Types ---------------- */
type SectionWrapperProps = {
  children: React.ReactNode;
  id: string;
};

type Project = {
  title: string;
  desc: string;
  tech: string[];
  links: { label: string; url: string }[];
};

/* ---------------- Animations ---------------- */
const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};


const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};


/* ---------------- Section Wrapper ---------------- */
const SectionWrapper = ({ children, id }: SectionWrapperProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className="py-28 px-6"
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </motion.section>
  );
};

/* ---------------- Navigation ---------------- */
const Navigation = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems: string[] = ['About', 'Skills', 'Projects', 'Contact'];

  const scrollTo = (id: string) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all ${
          scrolled
            ? 'bg-[#0b0f19]/80 backdrop-blur border-b border-gray-800'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => scrollTo('hero')} className="font-bold text-lg text-white">
            TP
          </button>

          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item)}
                className="text-sm text-gray-300 hover:text-blue-400 transition"
              >
                {item}
              </button>
            ))}
          </div>

          <button className="md:hidden text-gray-200" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 bg-[#020617] z-40 pt-24 px-6 md:hidden">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="block w-full text-left py-4 text-lg text-gray-300"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

/* ---------------- Hero ---------------- */
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center
      bg-gradient-to-br from-[#020617] via-[#0b0f19] to-[#020617]"
    >
      <motion.div style={{ y }} className="text-center px-6 max-w-4xl">
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full
        bg-blue-600/20 text-blue-400 border border-blue-500/30 text-sm">
          Entry-Level Data Analyst • Open to Opportunities
        </span>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
          Tirth Parikh
        </h1>

        <p className="text-xl text-blue-400 mb-4">
          Data Analyst | SQL | Python | Power BI | Tableau
        </p>

        <p className="text-gray-300 max-w-2xl mx-auto mb-10">
          Turning real-world data into actionable insights through analytics,
          dashboards, and data-driven storytelling.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/Tirth_Parikh_Data_Analyst.pdf"
            download
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700
            text-white rounded-lg flex gap-2 items-center transition"
          >
            <FileText size={18} /> Resume
          </a>
          
<a
  href="/Tirth_Parikh_Data_Analyst.pdf"
  target="_blank"
  rel="noopener noreferrer"
  className="px-6 py-3 border border-gray-700
  text-gray-200 hover:border-blue-400 hover:text-blue-400
  rounded-lg transition flex gap-2 items-center"
>
  <FileText size={18} /> View Resume
</a>

          <a
            href="https://github.com/Tirth262830"
            target="_blank"
            className="px-6 py-3 border border-gray-700
            text-gray-200 hover:border-blue-400 hover:text-blue-400
            rounded-lg transition"
          >
            <Github size={18} /> GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/tirth-parikh-199113339/"
            target="_blank"
            className="px-6 py-3 border border-gray-700
            text-gray-200 hover:border-blue-400 hover:text-blue-400
            rounded-lg transition"
          >
            <Linkedin size={18} /> LinkedIn
          </a>
        </div>

        <ChevronDown className="mx-auto mt-16 animate-bounce text-blue-400" />
      </motion.div>
    </section>
  );
};

/* ---------------- Skills ---------------- */
const SkillsSection = () => {
  const skills = [
    {
      title: 'Data Analytics & BI',
      items: ['SQL', 'Power BI', 'Tableau', 'Excel', 'DAX'],
    },
    {
      title: 'Programming',
      items: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
    },
    {
      title: 'Databases',
      items: ['MySQL', 'MongoDB'],
    },
    {
      title: 'Tools & Platforms',
      items: ['Git', 'Jupyter Notebook', 'Power Query'],
    },
  ];

  return (
    <SectionWrapper id="skills">
      <h2 className="text-4xl font-bold mb-12 text-white">Skills</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {skills.map((skill) => (
          <motion.div
            key={skill.title}
            variants={fadeInUp}
            className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {skill.title}
            </h3>

            <div className="flex flex-wrap gap-2">
              {skill.items.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 text-sm rounded
                  bg-blue-600/20 text-blue-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ---------------- Projects ---------------- */
const ProjectsSection = () => {
  const projects: Project[] = [
    {
      title: 'Student Mental Health Analysis Dashboard',
      desc: 'Analyzed 10K+ student records and built an interactive Tableau dashboard.',
      tech: ['SQL', 'Tableau'],
      links: [
        {
          label: 'Live Dashboard',
          url: 'https://public.tableau.com/app/profile/tirth.parikh1534/viz/StudentMentalHealthAnalysisDashboard_17679471530000/StudentMentalHealthAnalysis',
        },
      ],
    },
    {
      title: 'Forest Fire Prediction System',
      desc: 'ML model predicting forest fires with 80–85% accuracy.',
      tech: ['Python', 'Machine Learning'],
      links: [{ label: 'GitHub', url: 'https://github.com/Tirth262830/forestfire' }],
    },
    {
      title: 'Personal Expense Management System',
      desc: 'Full-stack expense tracker with authentication and analytics.',
      tech: ['Node.js', 'Express.js', 'MongoDB'],
      links: [
        { label: 'GitHub', url: 'https://github.com/Tirth262830/Expense-management' },
        { label: 'Live', url: 'https://your-expense-manager.vercel.app/' },
      ],
    },
  ];

  return (
    <SectionWrapper id="projects">
      <h2 className="text-4xl font-bold mb-12 text-white">Projects</h2>
      <div className="space-y-8">
        {projects.map((p) => (
          <motion.div
            key={p.title}
            variants={fadeInUp}
            className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl"
          >
            <h3 className="text-2xl font-semibold text-white mb-2">{p.title}</h3>
            <p className="text-gray-300 mb-4">{p.desc}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {p.tech.map((t) => (
                <span key={t} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              {p.links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700
                  text-white rounded text-sm flex items-center gap-2 transition"
                >
                  <ExternalLink size={14} /> {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

/* ---------------- Contact ---------------- */
const ContactSection = () => (
  <SectionWrapper id="contact">
    <h2 className="text-4xl font-bold mb-6 text-center text-white">Contact</h2>
    <div className="flex justify-center gap-8 text-gray-300">
      <a href="mailto:parikhtirth77@gmail.com"><Mail /></a>
      <a href="https://github.com/Tirth262830" target="_blank"><Github /></a>
      <a href="https://www.linkedin.com/in/tirth-parikh-199113339/" target="_blank"><Linkedin /></a>
    </div>
  </SectionWrapper>
);

/* ---------------- App ---------------- */
export default function Portfolio() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <SkillsSection />   {/* 👈 ADD THIS */}
      <ProjectsSection />
      <ContactSection />
    </>
  );
}

