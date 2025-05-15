import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import '../Pages/DocumentManager.css';

/** --- Helper Notification --- **/
function Notification({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`notification ${type}`}>
      {message}
      <span onClick={onClose} className="notification-close">&times;</span>
    </div>
  );
}

/** --- Modal --- **/
function Modal({ title, children, open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose} className="modal-closebtn">Close</button>
      </div>
    </div>
  );
}

/** --- FileUpload --- **/
const supportedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];


function FileUpload({ onUpload, notify }) {
  // ... state as before
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', description: '', tags: '' });
  const [error, setError] = useState('');

  const validateFile = (file) => {
    if (!supportedFileTypes.includes(file.type)) {
      setError('Unsupported file type');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return false;
    }
    return true;
  };
  const handleFileChange = (e) => {
    const fileToUpload = e.target.files[0];
    if (fileToUpload && validateFile(fileToUpload)) {
      setFile(fileToUpload);
      setError('');
    } else {
      setFile(null);
    }
  };
  const handleUpload = () => {
    if (!file) return;
    const uniqueId = uuidv4();
    onUpload({
      id: uniqueId,
      file,
      metadata,
      tags: metadata.tags.split(',').map(t => t.trim()).filter(Boolean),
      acl: [],
    });
    setFile(null);
    setMetadata({ title: '', description: '', tags: '' });
    notify('File uploaded successfully', 'success');
  };

  return (
    <div className="card file-upload">
      <h2>Upload Document</h2>
      <input type="file" onChange={handleFileChange} />
      <input type="text" placeholder="Title" value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })} />
      <input type="text" placeholder="Description" value={metadata.description} onChange={e => setMetadata({ ...metadata, description: e.target.value })} />
      <input type="text" placeholder="Tags (comma separated)" value={metadata.tags} onChange={e => setMetadata({ ...metadata, tags: e.target.value })} />
      <button disabled={!file} onClick={handleUpload}>Upload</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

/** --- FolderManager --- **/
function FolderManager({ folders, onCreate, onEdit, onDelete, notify }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', parentId: '', id: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const openCreate = () => { setEditMode(false); setModalOpen(true); setForm({ name: '', parentId: '', id: '' }); };
  const openEdit = folder => { setEditMode(true); setModalOpen(true); setForm({ name: folder.name, parentId: folder.parentId || '', id: folder.id }); };
  const openDelete = id => setConfirmDelete({ open: true, id });

  const handleFormSubmit = () => {
    if (!form.name.trim()) return;
    if (editMode) {
      onEdit(form);
      notify('Folder updated successfully', 'success');
    } else {
      onCreate({ id: uuidv4(), name: form.name.trim(), parentId: form.parentId || null });
      notify('Folder created successfully', 'success');
    }
    setModalOpen(false);
    setForm({ name: '', parentId: '', id: '' });
  };
  const handleDelete = () => {
    onDelete(confirmDelete.id);
    notify('Folder deleted', 'success');
    setConfirmDelete({ open: false, id: null });
  };

  return (
    <div className="card folder-manager">
      <div className="folder-head">
        <h2>Folder Management</h2>
        <button className="add-btn" onClick={openCreate}>+ Add Folder</button>
      </div>
      <ul className="folder-list">
        {folders.length === 0 && <li>No folders</li>}
        {folders.map(folder => (
          <li key={folder.id} className="folder-item">
            {folder.name}
            <span className="folder-actions">
              <button onClick={() => openEdit(folder)}>Edit</button>
              <button onClick={() => openDelete(folder.id)} className="delete">Delete</button>
            </span>
          </li>
        ))}
      </ul>
      <Modal
        open={modalOpen}
        title={editMode ? 'Edit Folder' : 'Create Folder'}
        onClose={() => setModalOpen(false)}>
        <input
          type="text"
          placeholder="Folder Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <select onChange={e => setForm({ ...form, parentId: e.target.value })} value={form.parentId}>
          <option value="">No parent</option>
          {folders.filter(f => !editMode || f.id !== form.id).map(f =>
            <option key={f.id} value={f.id}>{f.name}</option>
          )}
        </select>
        <div style={{ marginTop: 12 }}>
          <button className="confirm" onClick={handleFormSubmit}>{editMode ? 'Save Changes' : 'Create Folder'}</button>
        </div>
      </Modal>
      <Modal
        open={confirmDelete.open}
        title="Confirm Folder Deletion"
        onClose={() => setConfirmDelete({ open: false, id: null })}>
        <p>Are you sure you want to delete this folder?</p>
        <button className="delete" onClick={handleDelete}>Yes, Delete</button>
      </Modal>
    </div>
  );
}

/** --- TagManager & RBACManager (as before, minor style tweaks) --- **/
function TagManager({ document, onUpdateTags }) {
  const [tagInput, setTagInput] = React.useState('');
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !document.tags.includes(tag)) {
      onUpdateTags([...document.tags, tag]);
      setTagInput('');
    }
  };
  const removeTag = tagToRemove => {
    onUpdateTags(document.tags.filter(t => t !== tagToRemove));
  };
  return (
    <div className="tag-manager">
      <h4>Tags</h4>
      <div>
        {document.tags.map(tag => (
          <span key={tag} className="tag" onClick={() => removeTag(tag)}>
            {tag} &#x2716;
          </span>
        ))}
      </div>
      <input type="text" placeholder="Add tag" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} />
      <button onClick={addTag}>Add Tag</button>
    </div>
  );
}

function RBACManager({ acl, users, onUpdateACL }) {
  const [selectedUser, setSelectedUser] = React.useState('');
  const [permission, setPermission] = React.useState('view');
  const addPermission = () => {
    if (!selectedUser) return;
    const filteredACL = acl.filter(entry => entry.userId !== selectedUser);
    filteredACL.push({ userId: selectedUser, permission });
    onUpdateACL(filteredACL);
    setSelectedUser('');
    setPermission('view');
  };
  return (
    <div className="rbac-manager">
      <h4>Access Control</h4>
      <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
        <option value="">Select User</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      <select value={permission} onChange={e => setPermission(e.target.value)}>
        <option value="view">View</option>
        <option value="edit">Edit</option>
        <option value="download">Download</option>
      </select>
      <button onClick={addPermission} disabled={!selectedUser}>Assign Permission</button>
      <h5>Current Permissions</h5>
      <ul>
        {acl.map(entry => {
          const user = users.find(u => u.id === entry.userId);
          return <li key={entry.userId}>{user ? user.name : 'Unknown'}: {entry.permission}</li>;
        })}
      </ul>
    </div>
  );
}

/** --- Main App, Folders & Documents Collapsible, Notifications --- **/

function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [docsOpen, setDocsOpen] = useState(true);

  const users = [ { id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' } ];
  const notify = (message, type) => setNotification({ message, type });
  const clearNotification = () => setNotification({ message: '', type: '' });

  const handleUpload = doc => setDocuments(prev => [...prev, doc]);
  const createFolder = folder => setFolders(prev => [...prev, folder]);
  const editFolder = updated => setFolders(folders.map(f => f.id === updated.id ? { ...f, name: updated.name, parentId: updated.parentId } : f));
  const deleteFolder = id => setFolders(prev => prev.filter(f => f.id !== id));
  const updateTags = (docId, newTags) => setDocuments(docs => docs.map(doc => doc.id === docId ? { ...doc, tags: newTags } : doc));
  const updateACL = (docId, newACL) => setDocuments(docs => docs.map(doc => doc.id === docId ? { ...doc, acl: newACL } : doc));
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="container">
      <h1>Document Manager</h1>
      <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
      <div className="flex-row">
        <FileUpload onUpload={handleUpload} notify={notify} />
        <FolderManager
          folders={folders}
          onCreate={createFolder}
          onEdit={editFolder}
          onDelete={deleteFolder}
          notify={notify}
        />
      </div>

      <div className="card collapsible">
        <h2 onClick={() => setDocsOpen(o => !o)} className="collapsible-header">
          Documents {docsOpen ? '▼' : '►'}
        </h2>
        {docsOpen && (documents.length === 0
          ? <p>No documents uploaded yet.</p>
          : <ul>
              {documents.map(doc => (
                <li
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={selectedDocId === doc.id ? 'selected' : ''}
                >
                  {doc.metadata.title || doc.file.name}
                </li>
              ))}
            </ul>
        )}
      </div>

      {selectedDoc &&
        <div className="card">
          <h3>Manage Document: {selectedDoc.metadata.title || selectedDoc.file.name}</h3>
          <TagManager document={selectedDoc} onUpdateTags={tags => updateTags(selectedDoc.id, tags)} />
          <RBACManager acl={selectedDoc.acl} users={users} onUpdateACL={acl => updateACL(selectedDoc.id, acl)} />
        </div>
      }
    </div>
  );
}

export default DocumentManager;