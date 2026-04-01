
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  Star,
} from "lucide-react";
import Lenis from "lenis";
import emailjs from "emailjs-com";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type ContactFormErrors = Partial<Record<"name" | "email" | "message", string>>;

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const PROJECTS = [
  {
    id: 1,
    title: "NESTRIO Biggest Project",
    category: "Flagship",
    link: "https://project-rho-two-23.vercel.app/",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop",
    description: "A premium interactive portfolio with cinematic animations and modern UX.",
  },
  {
    id: 2,
    title: "3D Product Experience",
    category: "3D / Motion",
    link: "https://project-rho-two-23.vercel.app/",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2000&auto=format&fit=crop",
    description: "Immersive product showcase with depth, micro-interactions, and motion-rich design.",
  },
  {
    id: 3,
    title: "Interactive Landing Page",
    category: "Conversion",
    link: "https://project-rho-two-23.vercel.app/",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=2000&auto=format&fit=crop",
    description: "Award-caliber landing page with parallax, scroll-triggered momentum, and visual polish.",
  },
  {
    id: 4,
    title: "UI/UX Case Study",
    category: "Strategy",
    link: "https://project-rho-two-23.vercel.app/",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2000&auto=format&fit=crop",
    description: "Data-driven product design case study focused on user journey and conversion lift.",
  },
];

const REVIEWS = [
  {
    id: 1,
    name: "Elena Rostova",
    role: "CEO at TechFlow",
    text: "NESTRIO transformed our brand identity. The attention to detail and cinematic feel of our new site skyrocketed our conversion rates.",
  },
  {
    id: 2,
    name: "Marcus Lin",
    role: "Founder, Nova AI",
    text: "Working with NESTRIO was effortless. They didn't just design an interface; they engineered an incredible user experience.",
  },
  {
    id: 3,
    name: "Sarah Jenkins",
    role: "Creative Director",
    text: "The web design feels alive. It’s incredibly rare to find someone who deeply understands both aesthetics and cutting-edge frontend performance.",
  },
];

export default function Portfolio() {
  const lenisRef = useRef<Lenis | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { scrollYProgress } = useScroll();

  // 3D Card Interactive States
  const [cardRotateX, setCardRotateX] = useState(0);
  const [cardRotateY, setCardRotateY] = useState(0);
  const [projectTilt, setProjectTilt] = useState<{ id: number | null; rotateX: number; rotateY: number }>({
    id: null,
    rotateX: 0,
    rotateY: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    // Initialize Lenis for premium smooth scroll easing
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sections = ["hero", "about", "work", "contact"];
      
      let current = "hero";
      sections.forEach((section) => {
        const el = document.getElementById(section);
        if (el && scrollY >= el.offsetTop - 300) {
          current = section;
        }
      });
      setActiveSection(current);
    };

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, .hover-target, input, textarea")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);
    handleScroll();
    
    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  useEffect(() => {
    let currentProgress = 0;
    const loader = setInterval(() => {
      currentProgress = Math.min(100, currentProgress + Math.random() * 12 + 6);
      setLoadProgress(Math.round(currentProgress));
      if (currentProgress >= 100) {
        clearInterval(loader);
        setTimeout(() => setLoaded(true), 500);
      }
    }, 120);

    return () => clearInterval(loader);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(`#${id}`, { offset: -50 });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate max 15 degrees
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setCardRotateX(rotateX);
    setCardRotateY(rotateY);
  };

  const handleCardMouseLeave = () => {
    setCardRotateX(0);
    setCardRotateY(0);
  };

  const validateContactForm = (): ContactFormErrors => {
    const errors: ContactFormErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = "Please enter your name.";
    }

    if (!formData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!emailPattern.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.message.trim()) {
      errors.message = "Please add a short message.";
    }

    return errors;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    if (name === "name" || name === "email" || name === "message") {
      setFormErrors((currentErrors) => {
        if (!currentErrors[name]) {
          return currentErrors;
        }

        const nextErrors = { ...currentErrors };
        delete nextErrors[name];
        return nextErrors;
      });
    }

    if (submitState !== "idle") {
      setSubmitState("idle");
      setSubmitMessage("");
    }
  };

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitState === "sending") {
      return;
    }

    const validationErrors = validateContactForm();

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitState("error");
      setSubmitMessage("Please fix the highlighted fields and try again.");
      return;
    }

    if (formData.website.trim()) {
      setSubmitState("success");
      setSubmitMessage("Message sent successfully!");
      setFormData(initialFormData);
      setFormErrors({});
      return;
    }

    setSubmitState("sending");
    setSubmitMessage("");

    try {
      if (!formRef.current) {
        throw new Error("Contact form is unavailable.");
      }

      await emailjs.sendForm(
        "service_gnkex1d",
        "template_qxm2l0i",
        formRef.current,
        "ed4-Fw6I8sgq-jd8I"
      );

      setSubmitState("success");
      setSubmitMessage("Message sent successfully!");
      setFormData(initialFormData);
      setFormErrors({});
    } catch (error) {
      console.error("EmailJS error:", error);
      setSubmitState("error");
      setSubmitMessage(
        "Sending failed. Please try again in a moment or email me directly."
      );
    }
  };

  const getFieldClassName = (field?: keyof ContactFormErrors) =>
    `w-full rounded-xl border px-4 py-3 text-white transition-all duration-300 placeholder:text-gray-500 shadow-inner focus:outline-none ${
      field && formErrors[field]
        ? "border-red-400/80 bg-red-500/5 focus:border-red-300 focus:shadow-[0_0_16px_rgba(248,113,113,0.18)]"
        : "border-white/10 bg-[#0A0A0C] focus:border-purple-500 focus:shadow-[0_0_18px_rgba(147,51,234,0.22)]"
    } disabled:cursor-not-allowed disabled:opacity-70`;

  const cursorX = useSpring(mousePosition.x, { stiffness: 400, damping: 25 });
  const cursorY = useSpring(mousePosition.y, { stiffness: 400, damping: 25 });

  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white font-sans selection:bg-purple-600/30 selection:text-purple-200 overflow-hidden relative">
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed inset-0 z-[200] bg-[#07070a] flex flex-col items-center justify-center gap-8 text-center px-8"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-black tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-[#7c3aed] to-[#d8b4fe] drop-shadow-[0_0_30px_rgba(124,58,237,0.65)]"
            >
              NESTRIO
            </motion.h1>
            <div className="w-[80vw] max-w-[420px] bg-white/10 border border-purple-500/30 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-purple-700 via-purple-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="text-sm text-purple-200">Loading {loadProgress}%</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Premium Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[100] mix-blend-screen hidden md:flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          backgroundColor: isHovering ? "rgba(168, 85, 247, 0.4)" : "rgba(147, 51, 234, 0.6)",
          boxShadow: isHovering 
            ? "0 0 40px 15px rgba(168, 85, 247, 0.5)" 
            : "0 0 20px 5px rgba(147, 51, 234, 0.3)",
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <motion.div 
          className="w-1.5 h-1.5 bg-white rounded-full opacity-80"
          animate={{ scale: isHovering ? 0 : 1 }}
        />
      </motion.div>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-800 to-purple-400 origin-left z-50 pointer-events-none"
        style={{ scaleX }}
      />

      {/* Enhanced Soft Glowing 3D Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-900/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-800/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[150px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        {/* Premium Glassmorphic Navbar */}
        <motion.nav 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:min-w-[600px] border border-white/10 bg-[#0A0A0C]/60 backdrop-blur-xl rounded-full px-8 py-4 flex justify-between items-center z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-black text-white tracking-[0.2em] text-sm hover:text-purple-300 transition-colors duration-500 cursor-pointer hover-target pr-8 border-r border-white/10"
          >
            PORTFOLIO.
          </div>
          
          <div className="hidden md:flex gap-12 px-8 flex-1 justify-center relative">
            {["about", "work", "contact"].map((section) => (
              <motion.a 
                key={section}
                href={`#${section}`} 
                onClick={(e) => scrollToSection(e, section)} 
                whileHover={{ scale: 1.05 }}
                className={`relative uppercase tracking-widest text-[11px] font-semibold py-2 transition-all duration-300 hover-target ${
                  activeSection === section 
                    ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]' 
                    : 'text-gray-400 hover:text-purple-300 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]'
                }`}
              >
                <span className="relative z-10">{section}</span>
                {activeSection === section && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-purple-500 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.6)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="pl-6 md:pl-8 border-l border-white/10 hover-target">
            <div className="bg-white text-black text-[11px] uppercase tracking-widest font-bold px-6 py-2.5 rounded-full hover:bg-purple-500 hover:text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] transition-all duration-300 whitespace-nowrap">
              Hire Me
            </div>
          </a>
        </motion.nav>

        <section id="hero" className="min-h-screen flex items-center relative px-6 md:px-20 max-w-7xl mx-auto pt-32 md:pt-0">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 w-full items-center">
            {/* Left Col: Text */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="flex flex-col items-start relative z-10 text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-900/10 text-purple-300 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(147,51,234,0.15)]"
              >
                Available for freelance work
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)", y: 20 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-7xl md:text-[6rem] lg:text-[8rem] font-black tracking-tighter mb-4 relative leading-none"
              >
                <motion.span
                  animate={{
                    y: [-8, 8, -8],
                    scale: [1, 1.02, 1],
                    textShadow: [
                      "0px 0px 20px rgba(124,58,237,0.25)",
                      "0px 0px 80px rgba(147,51,234,0.8)",
                      "0px 0px 22px rgba(124,58,237,0.35)",
                    ],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-purple-300 to-fuchsia-400 relative z-10 inline-block py-2"
                >
                  NESTRIO
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-xl md:text-2xl text-gray-400 font-light mb-12 flex items-center gap-3"
              >
                Web Designer <span className="w-2 h-2 rounded-full bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.8)]" /> UI/UX Designer
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-6"
              >
                <a
                  href="#work"
                  onClick={(e) => scrollToSection(e, 'work')}
                  className="group relative inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-medium text-lg overflow-hidden hover-target shadow-lg shadow-white/5"
                >
                  <span className="relative z-10">View Selected Work</span>
                  <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                    <ArrowRight size={20} />
                  </span>
                  <div className="absolute inset-0 bg-purple-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1] z-0" />
                </a>
              </motion.div>
            </motion.div>

            {/* Right Col: Interactive 3D Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden md:block w-full max-w-sm mx-auto"
              style={{ perspective: 1000 }}
            >
              <motion.div
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                animate={{ rotateX: cardRotateX, rotateY: cardRotateY }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-full aspect-[4/5] rounded-[2rem] border border-white/10 bg-[#121216] relative overflow-hidden group hover-target transform-gpu shadow-[0_20px_50px_rgba(0,0,0,0.5)] will-change-transform"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/10 blur-[60px] rounded-full z-0 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-700" />
                
                <div 
                  className="absolute inset-[2px] rounded-[calc(2rem-2px)] bg-[#0A0A0C] border border-white/5 z-20 flex flex-col justify-between p-8 overflow-hidden pointer-events-none"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-600/20 rounded-full blur-[40px] mix-blend-screen" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <Star className="text-purple-400 drop-shadow-[0_0_10px_rgba(147,51,234,0.5)] animate-pulse" />
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium tracking-widest text-purple-200">
                      INTERACTIVE
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center z-0">
                     <motion.div 
                       animate={{ rotateZ: 360 }}
                       transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                       className="w-32 h-32 border border-purple-500/30 rounded-full opacity-50"
                     />
                     <motion.div 
                       animate={{ rotateZ: -360 }}
                       transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full border-dashed"
                     />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">Digital <br/> Experience</h3>
                    <p className="text-xs text-gray-500 font-light mt-2 uppercase tracking-wider">Move cursor to interact</p>
                  </div>
                </div>
              </motion.div>

              {/* Floor shadow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-8 bg-purple-600/20 rounded-full blur-[20px] pointer-events-none" />
            </motion.div>
          </div>
        </section>

        <section id="about" className="py-32 px-6 md:px-20 max-w-7xl mx-auto border-t border-white/5 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Designing interfaces that feel <span className="text-purple-400 italic font-medium drop-shadow-[0_0_15px_rgba(147,51,234,0.4)]">alive.</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-light">
                I operate at the intersection of aesthetic brilliance and engineering execution. 
                Using profound user psychology, motion principles, and modern frontend tools, I craft digital environments 
                that elevate brands to premium tiers.
              </p>
              
              <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">4+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Years Experience</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">Premium</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Quality Focus</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden group bg-[#121216] border border-white/10 flex items-center justify-center dashboard-mockup shadow-2xl"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent z-0"/>
               <motion.div 
                 animate={{ rotateZ: 360, rotateY: 360, rotateX: 360 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="w-48 h-48 rounded-full border border-purple-500/30 opacity-60 z-10 shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                 style={{ backdropFilter: "blur(10px)", background: "rgba(147, 51, 234, 0.05)" }}
               />
               <motion.div 
                 animate={{ rotateZ: -360, rotateY: -360, rotateX: 360 }}
                 transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                 className="absolute w-32 h-32 rounded-lg border border-white/10 bg-white/5 rotate-45 z-20 backdrop-blur-md shadow-xl"
               />
            </motion.div>
          </div>
        </section>

        <section id="work" className="py-32 px-6 md:px-20 border-t border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Selected Work</h2>
                <p className="text-xl text-gray-400 mt-4 font-light">A curated collection of digital experiences.</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
              {PROJECTS.map((project, index) => (
                <motion.a
                  key={project.id}
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  animate={
                    projectTilt.id === project.id
                      ? { rotateX: projectTilt.rotateX, rotateY: projectTilt.rotateY, scale: 1.03 }
                      : { rotateX: 0, rotateY: 0, scale: 1 }
                  }
                  onMouseMove={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;

                    setProjectTilt({
                      id: project.id,
                      rotateX: (y - 0.5) * -15,
                      rotateY: (x - 0.5) * 15,
                    });
                  }}
                  onMouseLeave={() => setProjectTilt({ id: null, rotateX: 0, rotateY: 0 })}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`group cursor-pointer hover-target ${index % 2 === 1 ? 'md:mt-32' : ''}`}
                >
                  <div className="overflow-hidden rounded-2xl md:rounded-[2rem] aspect-[4/3] relative mb-6 border border-white/5 shadow-2xl">
                    <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full bg-[#121216] relative"
                    >
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover opacity-80"
                      />
                    </motion.div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                        <ExternalLink size={24} />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold group-hover:text-purple-400 transition-colors drop-shadow-md">{project.title}</h3>
                      <span className="text-xs font-medium tracking-widest uppercase text-gray-400 border border-white/10 px-3 py-1 rounded-full bg-[#121216]">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-gray-400 font-light">{project.description}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-32 px-6 bg-[#121216] border-y border-white/5 relative z-10 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto relative">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 drop-shadow-md">Client Voices</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {REVIEWS.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  className="bg-[#0A0A0C] border border-white/5 p-8 rounded-3xl hover:bg-white/5 transition-colors hover-target shadow-xl"
                >
                  <div className="flex gap-1 mb-6 text-purple-400 drop-shadow-[0_0_5px_rgba(147,51,234,0.5)]">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-lg md:text-xl text-gray-300 mb-8 font-light leading-relaxed">
                    &quot;{review.text}&quot;
                  </p>
                  <div>
                    <div className="font-bold text-white">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-32 px-6 md:px-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-600 drop-shadow-2xl">
                Let&apos;s create <br/> something iconic.
              </h2>
              <p className="text-xl text-gray-400 font-light">
                Ready to elevate your digital presence? Drop a line and let&apos;s discuss your project.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-[#121216] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden text-left shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold mb-4 drop-shadow-md">Get in touch</h3>
                  <a href="mailto:sahilnestisbest917@gmail.com" className="inline-flex items-center gap-3 text-lg md:text-xl text-purple-400 hover:text-purple-300 hover:drop-shadow-[0_0_10px_rgba(147,51,234,0.5)] transition-all mb-8 hover-target break-all">
                    <Mail className="shrink-0" size={24} />
                    sahilnestisbest917@gmail.com
                  </a>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-400 border border-white/5 p-4 rounded-xl bg-[#0A0A0C] shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                      Currently available for freelance
                    </div>
                  </div>
                </div>
                
                <form
                  ref={formRef}
                  className="space-y-5"
                  onSubmit={sendEmail}
                  noValidate
                >
                  <div
                    className="absolute left-[-5000px] top-auto h-0 w-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-300"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Your name"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={submitState === "sending"}
                        aria-invalid={Boolean(formErrors.name)}
                        aria-describedby={formErrors.name ? "name-error" : undefined}
                        className={getFieldClassName("name")}
                      />
                      <AnimatePresence>
                        {formErrors.name && (
                          <motion.p
                            id="name-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-sm text-red-300"
                          >
                            {formErrors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={submitState === "sending"}
                        aria-invalid={Boolean(formErrors.email)}
                        aria-describedby={formErrors.email ? "email-error" : undefined}
                        className={getFieldClassName("email")}
                      />
                      <AnimatePresence>
                        {formErrors.email && (
                          <motion.p
                            id="email-error"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-sm text-red-300"
                          >
                            {formErrors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-gray-300"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      placeholder="Project inquiry"
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={submitState === "sending"}
                      className={getFieldClassName()}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-gray-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell me a little about your project..."
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={submitState === "sending"}
                      aria-invalid={Boolean(formErrors.message)}
                      aria-describedby={formErrors.message ? "message-error" : undefined}
                      className={`${getFieldClassName("message")} min-h-[140px] resize-none`}
                    />
                    <AnimatePresence>
                      {formErrors.message && (
                        <motion.p
                          id="message-error"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-sm text-red-300"
                        >
                          {formErrors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.85)]" />
                    Protected by a lightweight spam filter.
                  </div>

                  <AnimatePresence mode="wait">
                    {submitState === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -6 }}
                        className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
                      >
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{submitMessage}</p>
                          <p className="text-sm text-emerald-100/80">
                            Thanks for reaching out — I&apos;ll get back to you soon.
                          </p>
                        </div>
                      </motion.div>
                    ) : submitState === "error" && submitMessage ? (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -6 }}
                        className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 text-red-50 shadow-[0_0_20px_rgba(248,113,113,0.08)]"
                      >
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-400/15 text-red-300">
                          <AlertCircle size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">Couldn&apos;t send your message</p>
                          <p className="text-sm text-red-100/80">{submitMessage}</p>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={submitState === "sending"}
                    whileHover={submitState === "sending" ? undefined : { y: -1, scale: 1.01 }}
                    whileTap={submitState === "sending" ? undefined : { scale: 0.99 }}
                    className="group relative w-full overflow-hidden rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 px-4 py-4 font-semibold text-white shadow-[0_0_24px_rgba(147,51,234,0.35)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(168,85,247,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)] opacity-90" />
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {submitState === "sending" ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </span>
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="py-8 px-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 relative z-10 w-full max-w-7xl mx-auto mt-20">
          <p>Designed by NESTRIO © 2026</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-purple-400 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] transition-all cursor-pointer hover-target">Twitter</span>
            <span className="hover:text-purple-400 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] transition-all cursor-pointer hover-target">LinkedIn</span>
            <span className="hover:text-purple-400 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] transition-all cursor-pointer hover-target">Instagram</span>
            <span className="hover:text-purple-400 hover:drop-shadow-[0_0_8px_rgba(147,51,234,0.5)] transition-all cursor-pointer hover-target">Dribbble</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
