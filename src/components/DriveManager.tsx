import React, { useState, useEffect } from 'react';
import { HardDrive, LogIn, LogOut, FileText, Upload, RefreshCw, Trash2, Folder, Download, Save, UploadCloud } from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/googleAuth';
import { User } from 'firebase/auth';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

export default function DriveManager() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
        loadFiles();
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');
      const res = await fetch('https://www.googleapis.com/drive/v3/files?q=name contains "lucy_backup"&orderBy=modifiedTime desc&pageSize=10&fields=files(id,name,mimeType,modifiedTime)', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        setUser(result.user);
        loadFiles();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleBackup = async () => {
    const token = await getAccessToken();
    if (!token) return;
    
    setIsLoading(true);
    try {
      const appState = localStorage.getItem('quinn_state') || '{}';
      const fileContent = new Blob([appState], { type: 'application/json' });
      
      const metadata = {
        name: `lucy_backup_${new Date().toISOString().slice(0,10)}.json`,
        mimeType: 'application/json'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', fileContent);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file to Google Drive');
      }
      
      await loadFiles();
      alert('Backup saved successfully to Google Drive!');
    } catch (err: any) {
      console.error('Save to Drive failed:', err);
      alert('Failed to save backup: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (fileId: string) => {
    const confirmed = window.confirm("Are you sure you want to restore from this backup? Your current local state will be overwritten.");
    if (!confirmed) return;

    const token = await getAccessToken();
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      localStorage.setItem('quinn_state', JSON.stringify(data));
      window.location.reload();
    } catch (err) {
      console.error('Restore failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportZipToDrive = async () => {
    const token = await getAccessToken();
    if (!token) return;
    
    setIsLoading(true);
    try {
      const zipRes = await fetch('/api/export-zip');
      const blob = await zipRes.blob();
      
      const metadata = {
        name: `Lucy_Functional_Build_${new Date().toISOString().slice(0,10)}.zip`,
        mimeType: 'application/zip'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', blob);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file to Google Drive');
      }
      
      await loadFiles();
      alert("Fully functional build successfully exported to Google Drive!");
    } catch (err: any) {
      console.error('Export to Drive failed:', err);
      alert('Failed to export to Drive: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden p-6 text-[var(--txt)]">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--surface-high)] flex items-center justify-center border border-[var(--border)]">
          <HardDrive className="text-[var(--p)]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight">Google Drive Backup</h2>
          <p className="text-sm text-[var(--txt-mid)]">Backup and restore Lucy state securely to your Drive.</p>
        </div>
      </div>

      {needsAuth ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--surface-low)] rounded-xl border border-[var(--border)]">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Connect Google Drive</h3>
          <p className="text-[var(--txt-mid)] max-w-sm mb-6 text-sm">
            Authorize your Google account to enable saving and loading backups.
          </p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoggingIn ? <RefreshCw className="animate-spin" size={18} /> : <LogIn size={18} />}
            Sign in with Google
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-low)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-mid)]">
            <div className="flex items-center gap-3">
              <img src={user?.photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-[var(--border)]" />
              <div className="text-sm">
                <div className="font-medium">{user?.displayName}</div>
                <div className="text-[var(--txt-mid)] text-xs">{user?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleExportZipToDrive} disabled={isLoading} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/80 text-white font-medium rounded-lg hover:bg-emerald-500 transition-colors text-sm" title="Export Full Build">
                <UploadCloud size={16} /> Export App
              </button>
              <button onClick={handleBackup} disabled={isLoading} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--p)] text-white font-medium rounded-lg hover:bg-[var(--p)]/90 transition-colors text-sm" title="Backup State">
                <Save size={16} /> Backup Now
              </button>
              <button onClick={loadFiles} className="p-2 text-[var(--txt-mid)] hover:text-white hover:bg-[var(--surface-high)] rounded-lg transition-colors" title="Refresh">
                <RefreshCw size={16} className={isLoading ? "animate-spin text-[var(--p)]" : ""} />
              </button>
              <button onClick={handleLogout} className="p-2 text-[var(--txt-mid)] hover:text-red-400 hover:bg-[var(--surface-high)] rounded-lg transition-colors" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading && files.length === 0 ? (
              <div className="text-center py-12 text-[var(--txt-mid)] flex flex-col items-center gap-2">
                <RefreshCw className="animate-spin text-[var(--p)]" size={24} />
                <span className="text-sm mt-2">Connecting...</span>
              </div>
            ) : files.length > 0 ? (
              files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--border-strong)] transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="text-[var(--p)]" size={18} />
                    <div>
                      <div className="font-medium text-sm truncate">{file.name}</div>
                      <div className="text-[10px] text-[var(--txt-mid)]">{file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : ''}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRestore(file.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors text-xs"
                  >
                    <Download size={14} /> Restore
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[var(--txt-mid)] text-sm">
                No recent backups found. Click "Backup Now" to create one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
