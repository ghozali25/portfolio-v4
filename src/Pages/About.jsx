import React, { useEffect, memo, useMemo, useState, useCallback } from "react"
import { GitHubCalendar } from 'react-github-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { supabase } from "../lib/supabaseClient"
import { FileText, Code, Award, Globe, ArrowUpRight, Sparkles, UserCheck, Github } from "lucide-react"
import AOS from 'aos'
import 'aos/dist/aos.css'

// Memoized Components
const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2 
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]" 
        data-aos="zoom-in-up"
        data-aos-duration="600"
      >
        About Me
      </h2>
    </div>
    <p 
      className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
      data-aos-duration="800">
    </p>
  </div>
));

const ProfileImage = memo(() => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div 
      className="relative group" 
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      {/* Optimized gradient backgrounds with reduced complexity for mobile */}
      <div className="absolute -inset-6 opacity-[25%] z-0 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 rounded-full blur-2xl animate-spin-slower" />
        <div className="absolute inset-0 bg-gradient-to-l from-fuchsia-500 via-rose-500 to-pink-600 rounded-full blur-2xl animate-pulse-slow opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 rounded-full blur-2xl animate-float opacity-50" />
      </div>

      <div className="relative">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)] transform transition-all duration-700 group-hover:scale-105">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full z-20 transition-all duration-700 group-hover:border-white/40 group-hover:scale-105" />
          
          {/* Optimized overlay effects - disabled on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 transition-opacity duration-700 group-hover:opacity-0 hidden sm:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-blue-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block" />
          
          {(() => {
            const base = supabase.storage.from('profile-images').getPublicUrl('about/profile.png').data?.publicUrl;
            const ver = typeof window !== 'undefined' ? (localStorage.getItem('about_version') || '') : '';
            const aboutPhotoUrl = base ? `${base}?v=${encodeURIComponent(ver || Date.now())}` : '';
            return (
              <img
                src={aboutPhotoUrl || "/Photo.png"}
                alt="Profile"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                loading="lazy"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/Photo.png"; }}
              />
            );
          })()}

          {/* Advanced hover effects - desktop only */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/10 to-transparent transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000 delay-100" />
            <div className="absolute inset-0 rounded-full border-8 border-white/10 scale-0 group-hover:scale-100 transition-transform duration-700 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </div>
  </div>
));

const StatCard = memo(({ icon: Icon, color, value, label, description, animation }) => (
  <div data-aos={animation} data-aos-duration={1300} className="relative group">
    <div className="relative z-10 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col justify-between">
      
      <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 transition-transform group-hover:rotate-6">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <span 
          className="text-4xl font-bold text-white"
          data-aos="fade-up-left"
          data-aos-duration="1500"
          data-aos-anchor-placement="top-bottom"
        >
          {value}
        </span>
      </div>

      <div>
        <p 
          className="text-sm uppercase tracking-wider text-gray-300 mb-2"
          data-aos="fade-up"
          data-aos-duration="800"
          data-aos-anchor-placement="top-bottom"
        >
          {label}
        </p>
        <div className="flex items-center justify-between">
          <p 
            className="text-xs text-gray-400"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-anchor-placement="top-bottom"
          >
            {description}
          </p>
          <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  </div>
));

const AboutPage = () => {
  const [aboutSummary, setAboutSummary] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const startYear = 2022; // As per the reference image
    const result = [];
    for (let i = currentYear; i >= startYear; i--) {
      result.push(i);
    }
    return result;
  }, [currentYear]);
  // Memoized calculations
  const { totalProjects, totalCertificates, YearExperience } = useMemo(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const storedCertificates = JSON.parse(localStorage.getItem("certificates") || "[]");
    
    const startDate = new Date("2017-08-07");
    const today = new Date();
    const experience = today.getFullYear() - startDate.getFullYear() -
      (today < new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate()) ? 1 : 0);

    return {
      totalProjects: storedProjects.length,
      totalCertificates: storedCertificates.length,
      YearExperience: experience
    };
  }, []);

  // Load About summary from Supabase Storage
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = supabase.storage.from('profile-images').getPublicUrl('about/summary.txt');
        const ver = typeof window !== 'undefined' ? (localStorage.getItem('about_version') || '') : '';
        const url = data?.publicUrl ? `${data.publicUrl}?v=${encodeURIComponent(ver || Date.now())}` : '';
        if (!url) return;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const text = await res.text();
        setAboutSummary(text || "");
      } catch (e) {
        // ignore, fallback will be used
      }
    };
    loadSummary();
  }, []);

  // Load CV link from Supabase Storage (managed via Admin)
  useEffect(() => {
    const loadCvLink = async () => {
      try {
        const { data } = supabase.storage.from('profile-images').getPublicUrl('about/cv_link.txt');
        const ver = typeof window !== 'undefined' ? (localStorage.getItem('about_version') || '') : '';
        const url = data?.publicUrl ? `${data.publicUrl}?v=${encodeURIComponent(ver || Date.now())}` : '';
        if (!url) return;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const text = await res.text();
        setCvLink(text?.trim() || "");
      } catch (_) {
        // ignore
      }
    };
    loadCvLink();
  }, []);

  // Optimized AOS initialization
  useEffect(() => {
    const initAOS = () => {
      AOS.init({
        once: false, 
      });
    };

    initAOS();
    
    // Debounced resize handler
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initAOS, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoized stats data
  const statsData = useMemo(() => [
    {
      icon: Code,
      color: "from-[#6366f1] to-[#a855f7]",
      value: totalProjects,
      label: "Total Projects",
      description: "Innovative web solutions crafted",
      animation: "fade-right",
    },
    {
      icon: Award,
      color: "from-[#a855f7] to-[#6366f1]",
      value: totalCertificates,
      label: "Certificates",
      description: "Professional skills validated",
      animation: "fade-up",
    },
    {
      icon: Globe,
      color: "from-[#6366f1] to-[#a855f7]",
      value: YearExperience,
      label: "Years of Experience",
      description: "Continuous learning journey",
      animation: "fade-left",
    },
  ], [totalProjects, totalCertificates, YearExperience]);

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm:mt-0" 
      id="About"
    >
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span className="text-white">
                Hello, I'm
              </span>
              <span 
                className="block mt-2 text-gray-200"
                data-aos="fade-right"
                data-aos-duration="1300"
              >
                Ahmad Ghozali
              </span>
            </h2>
            
            <p 
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify pb-4 sm:pb-0"
              data-aos="fade-right"
              data-aos-duration="1500"
            >
              {aboutSummary || (
                "Saya berumur 28 Tahun Status Single, memiliki 3+ pengalaman di bidang akuntansi dan keuangan, 5+ di bidang data analyst, data science, pencapaian saya selama ini membuat sistem dan SOP yang memudahkan perusahaan dalam menjalankan bisnisnya, membantu dan membuat template report dan dashboard untuk stakeholder dan shareholder."
              )}
            </p>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-4 lg:px-0 w-full">
              <a href={cvLink || "https://drive.google.com/drive/folders/1BOm51Grsabb3zj6Xk27K-iRwI1zITcpo"} className="w-full lg:w-auto" target="_blank" rel="noopener noreferrer">
              <button 
                data-aos="fade-up"
                data-aos-duration="800"
                className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl animate-bounce-slow"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Download CV
              </button>
              </a>
              <a href="#Portofolio" className="w-full lg:w-auto">
              <button 
                data-aos="fade-up"
                data-aos-duration="1000"
                className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg border border-[#a855f7]/50 text-[#a855f7] font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 hover:bg-[#a855f7]/10 animate-bounce-slow delay-200"
              >
                <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
              </button>
              </a>
            </div>
          </div>

          <ProfileImage />
        </div>

        <a href="#Portofolio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 cursor-pointer">
            {statsData.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </a>

        {/* GitHub Contribution Calendar */}
        <div className="mt-16 sm:mt-20" data-aos="fade-up" data-aos-duration="1000">
          <div className="relative group overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-lg border border-white/10 p-4 sm:p-8">
            <div className="absolute -z-10 inset-0 bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white">
                  <Github className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">GitHub</h3>
                  <p className="text-xs md:text-sm text-gray-400">Contributions Stats</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="flex flex-col items-center flex-1 w-full overflow-hidden github-calendar-container">
                <GitHubCalendar 
                  username="ghozali25"
                  year={selectedYear}
                  blockSize={12}
                  blockMargin={4}
                  fontSize={14}
                  theme={{
                    light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                  }}
                  style={{
                    color: '#9ca3af',
                  }}
                  renderBlock={(block, activity) => (
                    React.cloneElement(block, {
                      'data-tooltip-id': 'github-tooltip',
                      'data-tooltip-content': `${activity.count} contributions on ${activity.date}`,
                    })
                  )}
                />
                <ReactTooltip id="github-tooltip" />
              </div>

              {/* Year Selection - GitHub Style (Vertical on the right) */}
              <div className="flex lg:flex-col flex-wrap gap-2 min-w-[100px]">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-left ${
                      selectedYear === year 
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-between items-center gap-4 text-xs md:text-sm text-gray-400 border-t border-white/5 pt-6">
              <div className="flex items-center gap-2">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#161b22]"></div>
                  <div className="w-3 h-3 rounded-sm bg-[#0e4429]"></div>
                  <div className="w-3 h-3 rounded-sm bg-[#006d32]"></div>
                  <div className="w-3 h-3 rounded-sm bg-[#26a641]"></div>
                  <div className="w-3 h-3 rounded-sm bg-[#39d353]"></div>
                </div>
                <span>More</span>
              </div>
              <div className="flex items-center gap-2 italic">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Scroll to explore contributions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
        .github-calendar-container svg {
          max-width: 100%;
        }

        /* Basic blocks styling */
        .github-calendar-container rect {
          transition: fill 0.3s;
        }

        /* 1. Dark Blocks (Empty) - Must be static and ALWAYS visible */
        .github-calendar-container rect[fill="#161b22"],
        .github-calendar-container rect[fill="var(--color-calendar-graph-day-bg)"] {
          animation: none !important;
          opacity: 1 !important;
          transform: none !important;
        }

        /* 2. Green Blocks (Active Contributions) - Falling animation */
        .github-calendar-container rect:not([fill="#161b22"]):not([fill="var(--color-calendar-graph-day-bg)"]) {
          animation: dropIn 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(-40px);
        }

        @keyframes dropIn {
          0% {
            opacity: 0;
            transform: translateY(-40px);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Randomized delays for active blocks only */
        ${Array.from({ length: 371 }, (_, i) => `
          .github-calendar-container rect:nth-child(${i + 1}):not([fill="#161b22"]) {
            animation-delay: ${Math.random() * 2}s;
          }
        `).join('')}
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default memo(AboutPage);