import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";

const Admin = () => {
  // Auth
  const [isAuthed, setIsAuthed] = useState(() => localStorage.getItem("admin_auth") === "1");
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });

  useEffect(() => {
    if (isAuthed) {
      loadData();
    }
  }, [isAuthed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.user === "ali" && loginForm.pass === "ali123") {
      localStorage.setItem("admin_auth", "1");
      setIsAuthed(true);
    } else {
      Swal.fire("Login gagal", "Username atau password salah", "error");
    }
  };

  const deleteCvLink = async () => {
    const res = await Swal.fire({ title: 'Delete CV link?', icon: 'warning', showCancelButton: true });
    if (!res.isConfirmed) return;
    try {
      await supabase.storage.from('profile-images').remove(['about/cv_link.txt']);
      setCvLink("");
      if (typeof window !== 'undefined') localStorage.setItem('about_version', String(Date.now()));
      Swal.fire('Deleted', 'CV link removed', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to delete CV link', 'error');
    }
  };

  const loadCvLink = async () => {
    try {
      const { data: list, error: listErr } = await supabase.storage.from('profile-images').list('about', { limit: 100 });
      if (listErr) { console.warn(listErr.message); }
      const has = (list || []).some((f) => f.name === 'cv_link.txt');
      if (!has) { setCvLink(""); return; }
      const { data } = supabase.storage.from('profile-images').getPublicUrl('about/cv_link.txt');
      const url = data?.publicUrl;
      if (!url) { setCvLink(""); return; }
      const res = await fetch(url);
      const text = await res.text();
      setCvLink((text || "").trim());
    } catch (e) {
      console.error(e);
    }
  };

  const saveCvLink = async () => {
    setCvSaving(true);
    try {
      // Basic validation: must be a PDF link (ends with .pdf) or Google Drive URL
      const isPdf = /\.pdf(\?|#|$)/i.test(cvLink || '');
      const isDrive = /https?:\/\/drive\.google\.com\//i.test(cvLink || '');
      if (!isPdf && !isDrive) {
        Swal.fire('Format tidak valid', 'Harap masukkan tautan ke file PDF (contoh: Google Drive link ke PDF).', 'warning');
        return;
      }
      const blob = new Blob([cvLink || ""], { type: 'text/plain' });
      const { error: upErr } = await supabase.storage.from('profile-images').upload('about/cv_link.txt', blob, { upsert: true, contentType: 'text/plain' });
      if (upErr) throw upErr;
      if (typeof window !== 'undefined') localStorage.setItem('about_version', String(Date.now()));
      Swal.fire('Success', 'CV link saved', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to save CV link', 'error');
    } finally {
      setCvSaving(false);
    }
  };

  const saveAboutSummary = async () => {
    setAboutSummarySaving(true);
    try {
      const blob = new Blob([aboutSummary || ""], { type: 'text/plain' });
      const { error: upErr } = await supabase.storage.from('profile-images').upload('about/summary.txt', blob, { upsert: true, contentType: 'text/plain' });
      if (upErr) throw upErr;
      if (typeof window !== 'undefined') localStorage.setItem('about_version', String(Date.now()));
      Swal.fire('Success', 'About summary saved', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to save about summary', 'error');
    } finally {
      setAboutSummarySaving(false);
    }
  };

  const deleteAboutSummary = async () => {
    const res = await Swal.fire({ title: 'Delete about summary?', icon: 'warning', showCancelButton: true });
    if (!res.isConfirmed) return;
    try {
      await supabase.storage.from('profile-images').remove(['about/summary.txt']);
      setAboutSummary("");
      if (typeof window !== 'undefined') localStorage.setItem('about_version', String(Date.now()));
      Swal.fire('Deleted', 'About summary removed', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to delete about summary', 'error');
    }
  };

  const loadAboutSummary = async () => {
    try {
      const { data: list, error: listErr } = await supabase.storage.from('profile-images').list('about', { limit: 100 });
      if (listErr) { console.warn(listErr.message); }
      const hasSummary = (list || []).some((f) => f.name === 'summary.txt');
      if (!hasSummary) { setAboutSummary(""); return; }
      const { data } = supabase.storage.from('profile-images').getPublicUrl('about/summary.txt');
      const url = data?.publicUrl;
      if (!url) { setAboutSummary(""); return; }
      const res = await fetch(url);
      const text = await res.text();
      setAboutSummary(text || "");
    } catch (e) {
      console.error(e);
    }
  };

  // About photo handlers
  const uploadAboutPhoto = async (file) => {
    if (!file) return;
    setAboutUploading(true);
    try {
      const path = 'about/profile.png';
      const { error: upErr } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      setAboutPhotoUrl(data?.publicUrl || "");
      if (aboutPreviewUrl) { URL.revokeObjectURL(aboutPreviewUrl); setAboutPreviewUrl(""); }
      setAboutSelectedFile(null);
      if (typeof window !== 'undefined') localStorage.setItem('about_version', String(Date.now()));
      Swal.fire('Success', 'About photo updated', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to upload about photo', 'error');
    } finally {
      setAboutUploading(false);
    }
  };

  const deleteAboutPhoto = async () => {
    const res = await Swal.fire({ title: 'Delete about photo?', icon: 'warning', showCancelButton: true });
    if (!res.isConfirmed) return;
    try {
      await supabase.storage.from('profile-images').remove(['about/profile.png']);
      setAboutPhotoUrl("");
      if (typeof window !== 'undefined') localStorage.setItem('about_version', String(Date.now()));
      Swal.fire('Deleted', 'About photo removed', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Failed to delete about photo', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setIsAuthed(false);
  };

  // Project form state
  const [projectForm, setProjectForm] = useState({
    Title: "",
    Description: "",
    Link: "",
    Github: "",
    TechStack: "",
    Features: "",
    Img: null,
  });
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Certificate form state
  const [certificateImg, setCertificateImg] = useState(null);
  const [isSavingCertificate, setIsSavingCertificate] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [editingCertificateId, setEditingCertificateId] = useState(null);

  // About photo state
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState("");
  const [aboutUploading, setAboutUploading] = useState(false);
  const [aboutSummary, setAboutSummary] = useState("");
  const [aboutSummarySaving, setAboutSummarySaving] = useState(false);
  const [cvLink, setCvLink] = useState("");
  const [cvSaving, setCvSaving] = useState(false);
  const [projectImgPreview, setProjectImgPreview] = useState("");
  const [certificatePreview, setCertificatePreview] = useState("");
  const [aboutSelectedFile, setAboutSelectedFile] = useState(null);
  const [aboutPreviewUrl, setAboutPreviewUrl] = useState("");

  const handleProjectChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "Img") {
      const file = files?.[0] || null;
      setProjectForm((prev) => ({ ...prev, Img: file }));
      if (file) {
        const url = URL.createObjectURL(file);
        setProjectImgPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } else {
        if (projectImgPreview) URL.revokeObjectURL(projectImgPreview);
        setProjectImgPreview("");
      }
    } else {
      setProjectForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetProjectForm = () => {
    setProjectForm({ Title: "", Description: "", Link: "", Github: "", TechStack: "", Features: "", Img: null });
    setEditingProjectId(null);
  };

  const onCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.Title || !projectForm.Description || !projectForm.Img) {
      Swal.fire("Required", "Title, Description, and Image are required", "warning");
      return;
    }

    setIsSavingProject(true);
    try {
      // Upload image to Supabase Storage
      const filePath = `projects/${Date.now()}_${projectForm.Img.name}`;
      const { error: upErr } = await supabase.storage.from('profile-images').upload(filePath, projectForm.Img, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      const ImgUrl = pub?.publicUrl;

      // Prepare arrays
      const TechStack = projectForm.TechStack
        ? projectForm.TechStack.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const Features = projectForm.Features
        ? projectForm.Features.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      // Save to Firestore (collection name matches existing code)
      const { error: insErr } = await supabase.from('projects').insert([
        {
          Title: projectForm.Title,
          Description: projectForm.Description,
          Link: projectForm.Link,
          Github: projectForm.Github || "",
          TechStack,
          Features,
          Img: ImgUrl,
        }
      ]);
      if (insErr) {
        Swal.fire("Error", (insErr.message || "Failed to create project") + "\nHint: Pastikan RLS policy INSERT untuk tabel 'projects' sudah diizinkan untuk public.", "error");
        throw insErr;
      }

      Swal.fire("Success", "Project created", "success");
      resetProjectForm();
      const projInput = document.querySelector('input[name="Img"]');
      if (projInput) projInput.value = "";
      await loadProjects();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create project", "error");
    } finally {
      setIsSavingProject(false);
    }
  };

  const onCreateCertificate = async (e) => {
    e.preventDefault();
    if (!certificateImg) {
      Swal.fire("Required", "Certificate image is required", "warning");
      return;
    }
    setIsSavingCertificate(true);
    try {
      const filePath = `certificates/${Date.now()}_${certificateImg.name}`;
      const { error: upErr } = await supabase.storage.from('profile-images').upload(filePath, certificateImg, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      const ImgUrl = pub?.publicUrl;

      const { error: insErr } = await supabase.from('certificates').insert([{ Img: ImgUrl }]);
      if (insErr) {
        Swal.fire("Error", (insErr.message || "Failed to add certificate") + "\nHint: Pastikan RLS policy INSERT untuk tabel 'certificates' sudah diizinkan untuk public.", "error");
        throw insErr;
      }

      Swal.fire("Success", "Certificate added", "success");
      setCertificateImg(null);
      if (certificatePreview) { URL.revokeObjectURL(certificatePreview); setCertificatePreview(""); }
      const input = document.getElementById("certificate-input");
      if (input) input.value = "";
      await loadCertificates();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add certificate", "error");
    } finally {
      setIsSavingCertificate(false);
    }
  };

  // Loaders
  const loadProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setProjects(data || []);
  };

  const loadCertificates = async () => {
    const { data, error } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setCertificates(data || []);
  };

  const loadAboutPhoto = async () => {
    try {
      // Check if file exists by listing folder
      const { data: list, error: listErr } = await supabase.storage.from('profile-images').list('about', { limit: 100 });
      if (listErr) { console.warn(listErr.message); }
      const hasProfile = (list || []).some((f) => f.name === 'profile.png');
      if (hasProfile) {
        const { data } = supabase.storage.from('profile-images').getPublicUrl('about/profile.png');
        setAboutPhotoUrl(data?.publicUrl || "");
      } else {
        setAboutPhotoUrl("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    await Promise.all([loadProjects(), loadCertificates(), loadAboutPhoto(), loadAboutSummary(), loadCvLink()]);
  };

  // Helpers
  const getStoragePathFromUrl = (publicUrl) => {
    if (!publicUrl) return null;
    const marker = '/storage/v1/object/public/profile-images/';
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.substring(idx + marker.length);
  };

  // Edit Project
  const startEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({
      Title: p.Title || "",
      Description: p.Description || "",
      Link: p.Link || "",
      Github: p.Github || "",
      TechStack: (p.TechStack || []).join(","),
      Features: (p.Features || []).join(","),
      Img: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEditProject = async (e) => {
    e.preventDefault();
    if (!editingProjectId) return;
    setIsSavingProject(true);
    try {
      let ImgUrl;
      if (projectForm.Img) {
        const filePath = `projects/${Date.now()}_${projectForm.Img.name}`;
        const { error: upErr } = await supabase.storage.from('profile-images').upload(filePath, projectForm.Img, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('profile-images').getPublicUrl(filePath);
        ImgUrl = pub?.publicUrl;
      }
      const TechStack = projectForm.TechStack ? projectForm.TechStack.split(",").map(s=>s.trim()).filter(Boolean) : [];
      const Features = projectForm.Features ? projectForm.Features.split(",").map(s=>s.trim()).filter(Boolean) : [];
      const payload = {
        Title: projectForm.Title,
        Description: projectForm.Description,
        Link: projectForm.Link,
        Github: projectForm.Github || "",
        TechStack,
        Features,
      };
      if (ImgUrl) payload.Img = ImgUrl;
      const { error: updErr } = await supabase.from('projects').update(payload).eq('id', Number(editingProjectId));
      if (updErr) {
        Swal.fire("Error", (updErr.message || "Failed to update project") + "\nHint: Pastikan RLS policy UPDATE untuk tabel 'projects' sudah diizinkan untuk public.", "error");
        throw updErr;
      }
      Swal.fire("Updated", "Project updated", "success");
      resetProjectForm();
      await loadProjects();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update project", "error");
    } finally {
      setIsSavingProject(false);
    }
  };

  const deleteProject = async (p) => {
    const res = await Swal.fire({ title: "Delete?", text: p.Title, icon: "warning", showCancelButton: true });
    if (!res.isConfirmed) return;
    // Try remove image from storage (best-effort)
    try {
      const path = getStoragePathFromUrl(p.Img);
      if (path) {
        await supabase.storage.from('profile-images').remove([path]);
      }
    } catch (e) { console.warn('Storage remove failed:', e?.message || e); }

    const { error } = await supabase.from('projects').delete().eq('id', Number(p.id));
    if (error) { console.error(error); Swal.fire("Error", error.message || "Failed to delete project", "error"); return; }
    await loadProjects();
    Swal.fire("Deleted", "Project removed", "success");
  };

  // Delete certificate
  const deleteCertificate = async (c) => {
    const res = await Swal.fire({ title: "Delete certificate?", icon: "warning", showCancelButton: true });
    if (!res.isConfirmed) return;
    // Try remove image from storage (best-effort)
    try {
      const path = getStoragePathFromUrl(c.Img);
      if (path) {
        await supabase.storage.from('profile-images').remove([path]);
      }
    } catch (e) { console.warn('Storage remove failed:', e?.message || e); }

    const { error } = await supabase.from('certificates').delete().eq('id', Number(c.id));
    if (error) { console.error(error); Swal.fire("Error", error.message || "Failed to delete certificate", "error"); return; }
    await loadCertificates();
    Swal.fire("Deleted", "Certificate removed", "success");
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white px-[5%] sm:px-[10%] py-10">
      {!isAuthed ? (
        <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input className="w-full p-3 rounded-lg bg-white/10 border border-white/10" value={loginForm.user} onChange={(e)=>setLoginForm({...loginForm, user:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input type="password" className="w-full p-3 rounded-lg bg-white/10 border border-white/10" value={loginForm.pass} onChange={(e)=>setLoginForm({...loginForm, pass:e.target.value})} />
            </div>
            <button type="submit" className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7]">Login</button>
          </form>
        </div>
      ) : (
      <>
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">Admin Panel</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400">Tambah, edit, hapus Projects dan Certificates. Data disimpan di Supabase (Postgres + Storage).</p>
        <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-white/10 border border-white/10">Logout</button>
      </div>

      {/* Project Form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">{editingProjectId ? 'Edit Project' : 'Create Project'}</h2>
        <form onSubmit={editingProjectId ? saveEditProject : onCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Title</label>
            <input name="Title" value={projectForm.Title} onChange={handleProjectChange} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none" required />
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Link (Live)</label>
            <input name="Link" value={projectForm.Link} onChange={handleProjectChange} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Github</label>
            <input name="Github" value={projectForm.Github} onChange={handleProjectChange} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea name="Description" value={projectForm.Description} onChange={handleProjectChange} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none" rows={3} required />
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Tech Stack (pisahkan dengan koma)</label>
            <input name="TechStack" value={projectForm.TechStack} onChange={handleProjectChange} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none" placeholder="React,Tailwind,Firebase" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm text-gray-300 mb-1">Features (pisahkan dengan koma)</label>
            <input name="Features" value={projectForm.Features} onChange={handleProjectChange} className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none" placeholder="Auth,Dashboard,etc" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1">Image {editingProjectId ? '(kosongkan jika tidak ganti)' : ''}</label>
            <input name="Img" type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setProjectForm({ ...projectForm, Img: file });
              if (projectImgPreview) { URL.revokeObjectURL(projectImgPreview); }
              if (file) setProjectImgPreview(URL.createObjectURL(file)); else setProjectImgPreview("");
            }} className="w-full" />
            {projectImgPreview && (
              <div className="mt-3">
                <img src={projectImgPreview} alt="preview" className="w-48 h-32 object-cover rounded-lg border border-white/10" />
              </div>
            )}
          </div>
          <div className="col-span-1 md:col-span-2 mt-2 flex gap-3">
            <button type="submit" disabled={isSavingProject} className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60">
              {isSavingProject ? (editingProjectId ? "Updating..." : "Saving...") : (editingProjectId ? "Update Project" : "Save Project")}
            </button>
            {editingProjectId && (
              <button type="button" onClick={resetProjectForm} className="px-6 py-3 rounded-lg bg-white/10 border border-white/10">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Project List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.Title}</h3>
                <div className="flex gap-2">
                  <button onClick={()=>startEditProject(p)} className="px-3 py-1 rounded bg-white/10">Edit</button>
                  <button onClick={()=>deleteProject(p)} className="px-3 py-1 rounded bg-red-500/20 text-red-300">Delete</button>
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">{p.Description}</p>
            </div>
          ))}
          {projects.length === 0 && <p className="text-gray-400">Belum ada project.</p>}
        </div>
      </div>

      {/* About Photo */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">About Photo</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-40 h-40 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
            {aboutPhotoUrl ? (
              <img src={aboutPhotoUrl} alt="About" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No photo</span>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <input
              id="about-photo-input"
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e)=>{
                const file = e.target.files?.[0] || null;
                setAboutSelectedFile(file);
                if (aboutPreviewUrl) { URL.revokeObjectURL(aboutPreviewUrl); }
                if (file) setAboutPreviewUrl(URL.createObjectURL(file)); else setAboutPreviewUrl("");
              }}
              disabled={aboutUploading}
            />
            {aboutPreviewUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Preview (belum diupload):</p>
                <img src={aboutPreviewUrl} alt="about preview" className="w-32 h-32 object-cover rounded-full border border-white/10" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => {
                const el = document.getElementById('about-photo-input');
                if (el) el.click();
              }} className="px-4 py-2 rounded-lg bg-white/10 border border-white/10" disabled={aboutUploading}>
                Pilih File
              </button>
              <button onClick={() => uploadAboutPhoto(aboutSelectedFile)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60" disabled={aboutUploading || !aboutSelectedFile}>
                {aboutUploading ? 'Uploading...' : 'Upload / Replace'}
              </button>
              {aboutPhotoUrl && (
                <button onClick={deleteAboutPhoto} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300">Delete</button>
              )}
            </div>
            <p className="text-xs text-gray-400">File disimpan di Storage: profile-images/about/profile.png</p>
          </div>
        </div>
      </div>

      {/* About Summary */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">About Summary</h2>
        <textarea
          className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none min-h-[140px]"
          placeholder="Tulis ringkasan About..."
          value={aboutSummary}
          onChange={(e)=>setAboutSummary(e.target.value)}
        />
        <div className="mt-3 flex gap-3">
          <button onClick={saveAboutSummary} disabled={aboutSummarySaving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60">
            {aboutSummarySaving ? 'Saving...' : 'Save'}
          </button>
          {aboutSummary && (
            <button onClick={deleteAboutSummary} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300">Delete</button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Disimpan di Storage: profile-images/about/summary.txt</p>
      </div>

      {/* About CV Link (PDF only) */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-2">About CV (PDF)</h2>
        <p className="text-xs text-gray-400 mb-3">Masukkan tautan ke file CV dalam format PDF (bukan foto profil). Contoh: tautan Google Drive yang mengarah ke PDF.</p>
        <input
          type="url"
          placeholder="https://..."
          className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none"
          value={cvLink}
          onChange={(e)=>setCvLink(e.target.value)}
          onPaste={(e)=>{
            const text = (e.clipboardData || window.clipboardData)?.getData('text');
            if (text) { e.preventDefault(); setCvLink(text.trim()); }
          }}
          onDrop={(e)=>{
            e.preventDefault();
            const text = e.dataTransfer?.getData('text/plain');
            if (text) setCvLink(text.trim());
          }}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="mt-3 flex gap-3">
          <button onClick={saveCvLink} disabled={cvSaving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60">
            {cvSaving ? 'Saving...' : 'Save'}
          </button>
          {cvLink && (
            <button onClick={deleteCvLink} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300">Delete</button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Disimpan di Storage: profile-images/about/cv_link.txt</p>
      </div>

      {/* Certificate Form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4">Add Certificate</h2>
        <form onSubmit={onCreateCertificate} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Certificate Image</label>
            <input
              id="certificate-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setCertificateImg(file);
                if (certificatePreview) { URL.revokeObjectURL(certificatePreview); }
                if (file) setCertificatePreview(URL.createObjectURL(file)); else setCertificatePreview("");
              }}
              className="w-full"
              required
            />
            {certificatePreview && (
              <div className="mt-3">
                <img src={certificatePreview} alt="preview" className="w-48 h-32 object-cover rounded-lg border border-white/10" />
              </div>
            )}
          </div>
          <div className="mt-2">
            <button type="submit" disabled={isSavingCertificate} className="w-full md:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60">
              {isSavingCertificate ? "Saving..." : "Save Certificate"}
            </button>
          </div>
        </form>
      </div>

      {/* Certificate List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mt-10">
        <h2 className="text-xl font-semibold mb-4">Certificates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {certificates.map((c) => (
            <div key={c.id} className="relative group">
              <img src={c.Img} alt="cert" className="w-full h-auto rounded-xl border border-white/10" />
              <button onClick={()=>deleteCertificate(c)} className="absolute top-2 right-2 px-3 py-1 rounded bg-red-500/70 text-white text-sm opacity-0 group-hover:opacity-100 transition">Delete</button>
            </div>
          ))}
          {certificates.length === 0 && <p className="text-gray-400">Belum ada certificate.</p>}
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Admin;
