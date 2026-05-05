import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  return (
    <section id="Experience" className="py-20 bg-[#030014] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            Work Experience
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            My professional journey and the companies I've had the pleasure to work with.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-[#6366f1] via-[#a855f7] to-[#6366f1] rounded-full opacity-30"></div>

              <div className="space-y-12">
                {experiences.map((exp, index) => (
                  <div key={exp.id} className={`relative flex items-center justify-between w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-[#030014] z-10 md:w-4 md:h-4 md:border-4"></div>

                    {/* Content Container */}
                    <div className="w-[45%] flex flex-col" data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}>
                      <div className="bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 group shadow-xl">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
                            {exp.company_icon ? (
                              <img src={exp.company_icon} alt={exp.company} className="w-6 h-6 md:w-8 md:h-8 object-contain" />
                            ) : (
                              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors break-words">{exp.company}</h3>
                            <p className="text-xs md:text-base text-purple-400 font-medium break-words">{exp.job_title}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-[10px] md:text-sm text-slate-400 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 md:w-4 h-3 md:h-4" />
                            <span>
                              {formatDate(exp.start_date)} - {exp.is_present ? 'Present' : formatDate(exp.end_date)}
                            </span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 md:w-4 h-3 md:h-4" />
                              <span className="break-words">{exp.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Description hidden on mobile, visible on desktop */}
                        <div className="text-slate-300 text-sm leading-relaxed text-left hidden md:block mt-4">
                          {exp.job_description && (
                            <ul className="list-none space-y-2">
                              {exp.job_description.split('\n').map((bullet, i) => (
                                <li key={i} className="flex gap-3 text-left">
                                  <span className="text-purple-500 shrink-0 select-none">•</span>
                                  <span className="flex-1 text-left leading-relaxed">
                                    {bullet.trim().startsWith('-') ? bullet.trim().substring(1).trim() : bullet.trim()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
