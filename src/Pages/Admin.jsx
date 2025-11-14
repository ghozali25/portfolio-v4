import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Swal from "sweetalert2";
import { Bell } from "lucide-react";

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

  const startEditCertificate = (c) => {
    setEditingCertificateId(c.id);
    setCertificateLink(c.Link || "");
    setCertificateImg(null);
    if (certificatePreview) { URL.revokeObjectURL(certificatePreview); setCertificatePreview(""); }
  };

  const saveEditCertificate = async (e) => {
    e.preventDefault();
    if (!editingCertificateId) return;
    setIsSavingCertificate(true);
    try {
      let ImgUrl;
      if (certificateImg) {
        const filePath = `certificates/${Date.now()}_${certificateImg.name}`;
        const { error: upErr } = await supabase.storage.from('profile-images').upload(filePath, certificateImg, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = await supabase.storage.from('profile-images').getPublicUrl(filePath);
        ImgUrl = pub?.publicUrl;
      }
      const payload = { Link: (certificateLink || null) };
      if (ImgUrl) payload.Img = ImgUrl;
      const { error: updErr } = await supabase.from('certificates').update(payload).eq('id', editingCertificateId);
      if (updErr) throw updErr;
      Swal.fire('Updated', 'Certificate updated', 'success');
      setEditingCertificateId(null);
      setCertificateImg(null);
      setCertificateLink("");
      if (certificatePreview) { URL.revokeObjectURL(certificatePreview); setCertificatePreview(""); }
      const input = document.getElementById('certificate-input');
      if (input) input.value = "";
      await loadCertificates();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to update certificate', 'error');
    } finally {
      setIsSavingCertificate(false);
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
  const [certificateLink, setCertificateLink] = useState("");
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

  // Clients state
  const [clientImg, setClientImg] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clients, setClients] = useState([]);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [clientPreview, setClientPreview] = useState("");
  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactsPage, setContactsPage] = useState(1);
  const [selectedContactIds, setSelectedContactIds] = useState([]);

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

      const { error: insErr } = await supabase.from('certificates').insert([{ Img: ImgUrl, Link: (certificateLink || null) }]);
      if (insErr) {
        Swal.fire("Error", (insErr.message || "Failed to add certificate") + "\nHint: Pastikan RLS policy INSERT untuk tabel 'certificates' sudah diizinkan untuk public.", "error");
        throw insErr;
      }

      Swal.fire("Success", "Certificate added", "success");
      setCertificateImg(null);
      setCertificateLink("");
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

  const loadClients = async () => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: true });
    if (error) { console.error(error); return; }
    setClients(data || []);
  };

  const loadContacts = async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return; }
    setContacts(data || []);
    setContactsPage(1);
    setSelectedContactIds([]);
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
    await Promise.all([loadProjects(), loadCertificates(), loadClients(), loadContacts(), loadAboutPhoto(), loadAboutSummary(), loadCvLink()]);
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

  // Create client
  const onCreateClient = async (e) => {
    e.preventDefault();
    if (!clientImg) { Swal.fire("Required", "Client image is required", "warning"); return; }
    setIsSavingClient(true);
    try {
      const filePath = `clients/${Date.now()}_${clientImg.name}`;
      const { error: upErr } = await supabase.storage.from('profile-images').upload(filePath, clientImg, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      const ImgUrl = pub?.publicUrl;

      const { error: insErr } = await supabase.from('clients').insert([{ Img: ImgUrl, Name: (clientName || null) }]);
      if (insErr) { Swal.fire("Error", insErr.message || "Failed to add client", "error"); throw insErr; }

      Swal.fire("Success", "Client added", "success");
      setClientImg(null); setClientName("");
      if (clientPreview) { URL.revokeObjectURL(clientPreview); setClientPreview(""); }
      const input = document.getElementById('client-input'); if (input) input.value = "";
      await loadClients();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add client", "error");
    } finally {
      setIsSavingClient(false);
    }
  };

  const deleteClient = async (c) => {
    const res = await Swal.fire({ title: "Delete client?", icon: "warning", showCancelButton: true });
    if (!res.isConfirmed) return;
    try {
      const path = getStoragePathFromUrl(c.Img);
      if (path) await supabase.storage.from('profile-images').remove([path]);
    } catch (e) { console.warn('Storage remove failed:', e?.message || e); }
    const { error } = await supabase.from('clients').delete().eq('id', Number(c.id));
    if (error) { console.error(error); Swal.fire("Error", error.message || "Failed to delete client", "error"); return; }
    await loadClients();
    Swal.fire("Deleted", "Client removed", "success");
  };

  // Contacts helpers
  const pageSizeContacts = 10;
  const totalContactsPages = Math.max(1, Math.ceil((contacts?.length || 0) / pageSizeContacts));
  const currentContacts = contacts.slice((contactsPage - 1) * pageSizeContacts, contactsPage * pageSizeContacts);

  const toggleSelectContact = (id) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCurrentContacts = () => {
    const currentIds = currentContacts.map((c) => c.id);
    const allSelected = currentIds.every((id) => selectedContactIds.includes(id));
    if (allSelected) {
      setSelectedContactIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedContactIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleBulkDeleteContacts = async () => {
    if (!selectedContactIds.length) return;
    const res = await Swal.fire({
      title: 'Delete selected messages?',
      text: `Total ${selectedContactIds.length} pesan akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });
    if (!res.isConfirmed) return;
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', selectedContactIds);
      if (error) throw error;
      await loadContacts();
      Swal.fire('Deleted', 'Selected messages removed', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Error', e.message || 'Failed to delete messages', 'error');
    }
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
        <div className="flex flex-col gap-2">
          <p className="text-gray-400">Tambah, edit, hapus Projects dan Certificates. Data disimpan di Supabase (Postgres + Storage).</p>
          <div className="inline-flex items-center gap-2 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1 w-fit">
            <div className="relative">
              <Bell className="w-4 h-4 text-[#6366f1]" />
              {contacts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white">
                  {contacts.length}
                </span>
              )}
            </div>
            <span>{contacts.length > 0 ? `${contacts.length} contact message(s)` : "No contact messages"}</span>
          </div>
        </div>
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

      {/* Contacts / Messages */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">Contact Messages</h2>
        {contacts.length === 0 ? (
          <p className="text-gray-400">Belum ada pesan.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 text-sm">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBulkDeleteContacts}
                  disabled={!selectedContactIds.length}
                  className="px-4 py-2 rounded-lg bg-red-500/80 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs"
                >
                  Delete Selected ({selectedContactIds.length})
                </button>
                <span className="text-gray-400 text-xs">
                  Page {contactsPage} of {totalContactsPages} (total {contacts.length})
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setContactsPage((p) => Math.max(1, p - 1))}
                  disabled={contactsPage === 1}
                  className="px-3 py-1 rounded bg-white/10 border border-white/10 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setContactsPage((p) => Math.min(totalContactsPages, p + 1))}
                  disabled={contactsPage === totalContactsPages}
                  className="px-3 py-1 rounded bg-white/10 border border-white/10 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-300 border-b border-white/10">
                    <th className="py-2 pr-3">
                      <input
                        type="checkbox"
                        className="accent-[#6366f1]"
                        onChange={toggleSelectAllCurrentContacts}
                        checked={
                          currentContacts.length > 0 &&
                          currentContacts.every((c) => selectedContactIds.includes(c.id))
                        }
                      />
                    </th>
                    <th className="py-2 pr-4">Tanggal</th>
                    <th className="py-2 pr-4">Nama</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2">Pesan</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 align-top">
                      <td className="py-2 pr-3 align-top">
                        <input
                          type="checkbox"
                          className="accent-[#6366f1]"
                          checked={selectedContactIds.includes(c.id)}
                          onChange={() => toggleSelectContact(c.id)}
                        />
                      </td>
                      <td className="py-2 pr-4 text-gray-400 text-xs align-top">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="py-2 pr-4 font-medium align-top">{c.name}</td>
                      <td className="py-2 pr-4 text-blue-300 break-all align-top">
                        <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>
                      </td>
                      <td className="py-2 text-gray-200 whitespace-pre-wrap align-top">
                        {c.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
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

      {/* Clients Form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">Add Client</h2>
        <form onSubmit={onCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Client Image</label>
            <input
              id="client-input"
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e)=>{ const file=e.target.files?.[0]||null; setClientImg(file); if (clientPreview) { URL.revokeObjectURL(clientPreview);} if (file) setClientPreview(URL.createObjectURL(file)); else setClientPreview(""); }}
              required
            />
            {clientPreview && (
              <div className="mt-3">
                <img src={clientPreview} alt="preview" className="w-32 h-32 object-contain rounded-lg border border-white/10 bg-white/5 p-2" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Client Name (optional)</label>
            <input
              type="text"
              value={clientName}
              onChange={(e)=>setClientName(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none"
              placeholder="Company Name"
            />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={isSavingClient} className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60">
              {isSavingClient ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>

      {/* Clients List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">Clients</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {clients.map((c)=> (
            <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2">
              <img src={c.Img} alt={c.Name||'Client'} className="w-20 h-20 object-contain rounded-lg bg-white/5 p-2 border border-white/10" />
              <div className="text-xs text-gray-300 truncate w-full text-center">{c.Name || '—'}</div>
              <button onClick={()=>deleteClient(c)} className="px-2 py-1 rounded bg-red-500/70 text-white text-xs">Delete</button>
            </div>
          ))}
          {clients.length === 0 && <p className="text-gray-400">Belum ada client.</p>}
        </div>
      </div>

      {/* Certificate Form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-4">{editingCertificateId ? 'Edit Certificate' : 'Add Certificate'}</h2>
        <form onSubmit={editingCertificateId ? saveEditCertificate : onCreateCertificate} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Certificate Image{editingCertificateId ? ' (optional)' : ''}</label>
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
              required={!editingCertificateId}
            />
            {certificatePreview && (
              <div className="mt-3">
                <img src={certificatePreview} alt="preview" className="w-48 h-32 object-cover rounded-lg border border-white/10" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Credential Link (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none"
              value={certificateLink}
              onChange={(e)=>setCertificateLink(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <div className="flex gap-3">
              <button type="submit" disabled={isSavingCertificate} className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] disabled:opacity-60">
                {isSavingCertificate ? (editingCertificateId ? 'Saving...' : 'Saving...') : (editingCertificateId ? 'Update Certificate' : 'Save Certificate')}
              </button>
              {editingCertificateId && (
                <button type="button" onClick={()=>{ setEditingCertificateId(null); setCertificateImg(null); setCertificateLink(""); const input = document.getElementById('certificate-input'); if (input) input.value = ""; if (certificatePreview) { URL.revokeObjectURL(certificatePreview); setCertificatePreview(""); } }} className="px-6 py-3 rounded-lg bg-white/10 border border-white/10">Cancel</button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Certificate List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 mt-10">
        <h2 className="text-xl font-semibold mb-4">Certificates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {certificates.map((c) => (
            <div key={c.id} className="relative group p-2 rounded-xl bg-white/5 border border-white/10">
              <img src={c.Img} alt="cert" className="w-full h-auto rounded-lg border border-white/10" />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-400 truncate pr-2">{c.Link || "No credential link"}</div>
                <div className="flex gap-2">
                  <button onClick={()=>startEditCertificate(c)} className="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Edit</button>
                  {c.Link && (
                    <a href={c.Link} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Open</a>
                  )}
                  <button onClick={()=>deleteCertificate(c)} className="px-2 py-1 rounded bg-red-500/70 text-white text-xs">Delete</button>
                </div>
              </div>
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
