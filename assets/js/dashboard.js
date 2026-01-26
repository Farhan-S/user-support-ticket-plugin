const { render, useState, useEffect } = wp.element;
const { apiFetch } = wp;

// Main Dashboard Component
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await fetch(ustData.apiUrl + '/stats', {
                headers: {
                    'X-WP-Nonce': ustData.nonce
                }
            });
            const data = await response.json();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading stats:', error);
            setLoading(false);
        }
    };

    return (
        <div className="ust-dashboard">
            <div className="ust-dashboard-header">
                <h1>My Dashboard</h1>
                <div className="ust-stats">
                    <div className="ust-stat-card">
                        <div className="ust-stat-number">{stats.total || 0}</div>
                        <div className="ust-stat-label">Total Tickets</div>
                    </div>
                    <div className="ust-stat-card">
                        <div className="ust-stat-number">{stats.open || 0}</div>
                        <div className="ust-stat-label">Open</div>
                    </div>
                    <div className="ust-stat-card">
                        <div className="ust-stat-number">{stats.in_progress || 0}</div>
                        <div className="ust-stat-label">In Progress</div>
                    </div>
                    <div className="ust-stat-card">
                        <div className="ust-stat-number">{stats.closed || 0}</div>
                        <div className="ust-stat-label">Closed</div>
                    </div>
                </div>
            </div>

            <div className="ust-dashboard-nav">
                <button 
                    className={`ust-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button 
                    className={`ust-nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tickets')}
                >
                    My Tickets
                </button>
                <button 
                    className={`ust-nav-btn ${activeTab === 'create' ? 'active' : ''}`}
                    onClick={() => setActiveTab('create')}
                >
                    Create Ticket
                </button>
            </div>

            <div className="ust-dashboard-content">
                {activeTab === 'profile' && <ProfileSection />}
                {activeTab === 'tickets' && <TicketsSection onStatsUpdate={loadStats} />}
                {activeTab === 'create' && <CreateTicketSection onTicketCreated={() => {
                    setActiveTab('tickets');
                    loadStats();
                }} />}
            </div>
        </div>
    );
};

// Profile Section Component
const ProfileSection = () => {
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await fetch(ustData.apiUrl + '/profile', {
                headers: {
                    'X-WP-Nonce': ustData.nonce
                }
            });
            const data = await response.json();
            setProfile(data);
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                email: data.email || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error loading profile:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(ustData.apiUrl + '/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ustData.nonce
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Profile updated successfully!');
                setEditing(false);
                loadProfile();
            } else {
                setMessage(data.message || 'Error updating profile');
            }
        } catch (error) {
            setMessage('Error updating profile');
            console.error('Error:', error);
        }
    };

    if (loading) return <div className="ust-loading">Loading profile...</div>;

    return (
        <div className="ust-profile-section">
            <div className="ust-section-header">
                <h2>Profile Details</h2>
                {!editing && (
                    <button className="ust-btn ust-btn-primary" onClick={() => setEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            {message && <div className="ust-message">{message}</div>}

            {!editing ? (
                <div className="ust-profile-view">
                    <div className="ust-profile-field">
                        <label>Username:</label>
                        <span>{profile.username}</span>
                    </div>
                    <div className="ust-profile-field">
                        <label>Email:</label>
                        <span>{profile.email}</span>
                    </div>
                    <div className="ust-profile-field">
                        <label>First Name:</label>
                        <span>{profile.first_name || 'Not set'}</span>
                    </div>
                    <div className="ust-profile-field">
                        <label>Last Name:</label>
                        <span>{profile.last_name || 'Not set'}</span>
                    </div>
                    <div className="ust-profile-field">
                        <label>Member Since:</label>
                        <span>{new Date(profile.registered).toLocaleDateString()}</span>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="ust-profile-form">
                    <div className="ust-form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            className="ust-input"
                        />
                    </div>
                    <div className="ust-form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            className="ust-input"
                        />
                    </div>
                    <div className="ust-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="ust-input"
                            required
                        />
                    </div>
                    <div className="ust-form-actions">
                        <button type="submit" className="ust-btn ust-btn-primary">
                            Save Changes
                        </button>
                        <button 
                            type="button" 
                            className="ust-btn ust-btn-secondary"
                            onClick={() => setEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

// Create Ticket Section Component
const CreateTicketSection = ({ onTicketCreated }) => {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setSubmitting(true);

        try {
            const response = await fetch(ustData.apiUrl + '/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ustData.nonce
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Ticket created successfully!');
                setFormData({ subject: '', message: '', priority: 'medium' });
                setTimeout(() => {
                    onTicketCreated();
                }, 1500);
            } else {
                setMessage(data.message || 'Error creating ticket');
            }
        } catch (error) {
            setMessage('Error creating ticket');
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ust-create-ticket-section">
            <h2>Create Support Ticket</h2>
            
            {message && <div className="ust-message">{message}</div>}

            <form onSubmit={handleSubmit} className="ust-ticket-form">
                <div className="ust-form-group">
                    <label>Subject *</label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="ust-input"
                        required
                        placeholder="Brief description of your issue"
                    />
                </div>

                <div className="ust-form-group">
                    <label>Priority</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="ust-select"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="ust-form-group">
                    <label>Message *</label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="ust-textarea"
                        required
                        rows="6"
                        placeholder="Provide detailed information about your issue..."
                    ></textarea>
                </div>

                <button 
                    type="submit" 
                    className="ust-btn ust-btn-primary"
                    disabled={submitting}
                >
                    {submitting ? 'Creating...' : 'Create Ticket'}
                </button>
            </form>
        </div>
    );
};

// Tickets Section Component
const TicketsSection = ({ onStatsUpdate }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showReplies, setShowReplies] = useState(false);

    useEffect(() => {
        loadTickets();
    }, [filter]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            let url = ustData.apiUrl + '/tickets';
            if (filter !== 'all') {
                url += '?status=' + filter;
            }

            const response = await fetch(url, {
                headers: {
                    'X-WP-Nonce': ustData.nonce
                }
            });
            const data = await response.json();
            setTickets(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading tickets:', error);
            setLoading(false);
        }
    };

    const handleViewReplies = (ticket) => {
        setSelectedTicket(ticket);
        setShowReplies(true);
    };

    const handleCloseTicket = async (ticketId) => {
        if (!confirm('Are you sure you want to close this ticket?')) return;

        try {
            const response = await fetch(ustData.apiUrl + '/tickets/' + ticketId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ustData.nonce
                },
                body: JSON.stringify({ status: 'closed' })
            });

            if (response.ok) {
                loadTickets();
                onStatsUpdate();
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'open': return 'ust-badge-open';
            case 'in_progress': return 'ust-badge-progress';
            case 'closed': return 'ust-badge-closed';
            default: return '';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'high': return 'ust-badge-high';
            case 'medium': return 'ust-badge-medium';
            case 'low': return 'ust-badge-low';
            default: return '';
        }
    };

    if (showReplies) {
        return <TicketRepliesView 
            ticket={selectedTicket} 
            onBack={() => setShowReplies(false)}
            onUpdate={() => {
                loadTickets();
                onStatsUpdate();
            }}
        />;
    }

    return (
        <div className="ust-tickets-section">
            <div className="ust-section-header">
                <h2>My Support Tickets</h2>
                <div className="ust-filter-buttons">
                    <button 
                        className={`ust-filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`ust-filter-btn ${filter === 'open' ? 'active' : ''}`}
                        onClick={() => setFilter('open')}
                    >
                        Open
                    </button>
                    <button 
                        className={`ust-filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
                        onClick={() => setFilter('in_progress')}
                    >
                        In Progress
                    </button>
                    <button 
                        className={`ust-filter-btn ${filter === 'closed' ? 'active' : ''}`}
                        onClick={() => setFilter('closed')}
                    >
                        Closed
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="ust-loading">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="ust-empty-state">
                    <p>No tickets found.</p>
                </div>
            ) : (
                <div className="ust-tickets-list">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="ust-ticket-card">
                            <div className="ust-ticket-header">
                                <h3>{ticket.subject}</h3>
                                <div className="ust-ticket-badges">
                                    <span className={`ust-badge ${getStatusBadgeClass(ticket.status)}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    <span className={`ust-badge ${getPriorityBadgeClass(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="ust-ticket-body">
                                <p>{ticket.message.substring(0, 150)}{ticket.message.length > 150 ? '...' : ''}</p>
                            </div>
                            <div className="ust-ticket-footer">
                                <div className="ust-ticket-date">
                                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                                <div className="ust-ticket-actions">
                                    <button 
                                        className="ust-btn ust-btn-small ust-btn-secondary"
                                        onClick={() => handleViewReplies(ticket)}
                                    >
                                        View / Reply
                                    </button>
                                    {ticket.status !== 'closed' && (
                                        <button 
                                            className="ust-btn ust-btn-small ust-btn-danger"
                                            onClick={() => handleCloseTicket(ticket.id)}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Ticket Replies View Component
const TicketRepliesView = ({ ticket, onBack, onUpdate }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReplies();
    }, []);

    const loadReplies = async () => {
        try {
            const response = await fetch(ustData.apiUrl + '/tickets/' + ticket.id + '/replies', {
                headers: {
                    'X-WP-Nonce': ustData.nonce
                }
            });
            const data = await response.json();
            setReplies(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading replies:', error);
            setLoading(false);
        }
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmitting(true);

        try {
            const response = await fetch(ustData.apiUrl + '/tickets/' + ticket.id + '/replies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': ustData.nonce
                },
                body: JSON.stringify({ message: replyText })
            });

            if (response.ok) {
                setReplyText('');
                loadReplies();
                onUpdate();
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="ust-ticket-replies-view">
            <div className="ust-replies-header">
                <button className="ust-btn ust-btn-secondary" onClick={onBack}>
                    ← Back to Tickets
                </button>
            </div>

            <div className="ust-ticket-detail">
                <h2>{ticket.subject}</h2>
                <div className="ust-ticket-meta">
                    <span className="ust-badge">{ticket.status.replace('_', ' ')}</span>
                    <span className="ust-badge">{ticket.priority} priority</span>
                    <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                <div className="ust-ticket-message">
                    <p>{ticket.message}</p>
                </div>
            </div>

            <div className="ust-replies-section">
                <h3>Replies</h3>
                {loading ? (
                    <div className="ust-loading">Loading replies...</div>
                ) : replies.length === 0 ? (
                    <p className="ust-no-replies">No replies yet.</p>
                ) : (
                    <div className="ust-replies-list">
                        {replies.map(reply => (
                            <div key={reply.id} className={`ust-reply ${reply.is_admin_reply ? 'ust-admin-reply' : ''}`}>
                                <div className="ust-reply-header">
                                    <strong>{reply.user_name}</strong>
                                    {reply.is_admin_reply && <span className="ust-admin-badge">Admin</span>}
                                    <span className="ust-reply-date">
                                        {new Date(reply.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="ust-reply-body">
                                    <p>{reply.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {ticket.status !== 'closed' && (
                    <form onSubmit={handleSubmitReply} className="ust-reply-form">
                        <h4>Add Reply</h4>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="ust-textarea"
                            rows="4"
                            placeholder="Type your reply..."
                            required
                        ></textarea>
                        <button 
                            type="submit" 
                            className="ust-btn ust-btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Sending...' : 'Send Reply'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('ust-dashboard-root');
    if (rootElement) {
        render(<Dashboard />, rootElement);
    }
});
