import React from 'react';
import { FileText, Download, Share2, MoreVertical, ShieldCheck, Clock, Trash2 } from 'lucide-react';

const FileCard = ({ file, isShared, onDownload, onShare }) => {
    // Parsing date
    const dateStr = new Date(file.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const [showMenu, setShowMenu] = React.useState(false);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="glass-panel file-card hover-scale">
            <div className="file-header">
                <div className="file-icon-wrapper">
                    <FileText size={24} color="var(--accent)" />
                </div>
                {!isShared && (
                    <div className="menu-container" ref={menuRef}>
                        <button
                            className="more-btn"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical size={16} />
                        </button>
                        {showMenu && (
                            <div className="dropdown-menu">
                                <button onClick={() => {
                                    setShowMenu(false);
                                    if (onShare) onShare(file);
                                }}>
                                    <Share2 size={14} /> Share
                                </button>
                                <button className="delete-option" onClick={() => {
                                    setShowMenu(false);
                                    if (file.onDelete) file.onDelete(file._id);
                                }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="file-body">
                <h4 className="file-name" title={file.fileName || file.title}>
                    {file.fileName || file.title}
                </h4>
                <div className="file-meta">
                    <div className="meta-item">
                        <Clock size={12} />
                        <span>{dateStr}</span>
                    </div>
                    {isShared && (
                        <div className="meta-item owner-tag">
                            <ShieldCheck size={12} />
                            <span>{file.owner?.username}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="file-footer">
                <button
                    onClick={() => onDownload(file._id, file.fileName)}
                    className="action-btn download-btn"
                    title="Download & Decrypt"
                    style={{ width: '100%' }}
                >
                    <Download size={16} />
                    <span style={{ marginLeft: '8px', fontSize: '0.9rem' }}>Download</span>
                </button>
            </div>
        </div>
    );
};

export default FileCard;
