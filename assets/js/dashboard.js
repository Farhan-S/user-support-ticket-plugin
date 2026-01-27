/**
 * User Support Tickets Dashboard
 * Vanilla JavaScript implementation (no JSX, no build process)
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }

    function initDashboard() {
        const rootElement = document.getElementById('ust-dashboard-root');
        
        if (!rootElement) {
            console.error('Dashboard root element not found');
            return;
        }

        // Check dependencies
        if (typeof ustData === 'undefined') {
            showError(rootElement, 'Plugin configuration not loaded. Please refresh the page.');
            return;
        }

        // Initialize the dashboard
        const dashboard = new UserDashboard(rootElement);
        dashboard.init();
    }

    function showError(container, message) {
        container.innerHTML = `
            <div class="ust-error">
                <strong>Error:</strong> ${escapeHtml(message)}
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Main Dashboard Class
     */
    class UserDashboard {
        constructor(container) {
            this.container = container;
            this.activeTab = 'profile';
            this.stats = { total: 0, open: 0, in_progress: 0, closed: 0 };
            this.currentTicket = null;
            this.tickets = [];
        }

        async init() {
            await this.loadStats();
            this.render();
        }

        async loadStats() {
            try {
                const response = await fetch(ustData.apiUrl + '/stats', {
                    headers: { 'X-WP-Nonce': ustData.nonce }
                });
                if (response.ok) {
                    this.stats = await response.json();
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        render() {
            this.container.innerHTML = `
                <div class="ust-dashboard">
                    <div class="ust-dashboard-header">
                        <h1>My Dashboard</h1>
                        <div class="ust-stats">
                            <div class="ust-stat-card">
                                <div class="ust-stat-number">${this.stats.total || 0}</div>
                                <div class="ust-stat-label">Total Tickets</div>
                            </div>
                            <div class="ust-stat-card">
                                <div class="ust-stat-number">${this.stats.open || 0}</div>
                                <div class="ust-stat-label">Open</div>
                            </div>
                            <div class="ust-stat-card">
                                <div class="ust-stat-number">${this.stats.in_progress || 0}</div>
                                <div class="ust-stat-label">In Progress</div>
                            </div>
                            <div class="ust-stat-card">
                                <div class="ust-stat-number">${this.stats.closed || 0}</div>
                                <div class="ust-stat-label">Closed</div>
                            </div>
                        </div>
                    </div>

                    <div class="ust-dashboard-nav">
                        <button class="ust-nav-btn ${this.activeTab === 'profile' ? 'active' : ''}" data-tab="profile">
                            Profile
                        </button>
                        <button class="ust-nav-btn ${this.activeTab === 'tickets' ? 'active' : ''}" data-tab="tickets">
                            My Tickets
                        </button>
                        <button class="ust-nav-btn ${this.activeTab === 'create' ? 'active' : ''}" data-tab="create">
                            Create Ticket
                        </button>
                    </div>

                    <div class="ust-dashboard-content" id="ust-tab-content">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            `;

            // Attach event listeners
            this.attachNavListeners();
            
            // Load initial tab
            this.switchTab(this.activeTab);
        }

        attachNavListeners() {
            const navButtons = this.container.querySelectorAll('.ust-nav-btn');
            navButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tab = e.target.getAttribute('data-tab');
                    this.switchTab(tab);
                });
            });
        }

        async switchTab(tab) {
            this.activeTab = tab;
            
            // Update active button
            const navButtons = this.container.querySelectorAll('.ust-nav-btn');
            navButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
            });

            const contentDiv = document.getElementById('ust-tab-content');
            
            switch(tab) {
                case 'profile':
                    await this.renderProfile(contentDiv);
                    break;
                case 'tickets':
                    await this.renderTickets(contentDiv);
                    break;
                case 'create':
                    this.renderCreateTicket(contentDiv);
                    break;
            }
        }

        async renderProfile(container) {
            container.innerHTML = '<div class="ust-loading">Loading profile...</div>';
            
            try {
                const response = await fetch(ustData.apiUrl + '/profile', {
                    headers: { 'X-WP-Nonce': ustData.nonce }
                });
                const profile = await response.json();
                
                const registered = new Date(profile.registered).toLocaleDateString();
                
                container.innerHTML = `
                    <div class="ust-profile-section">
                        <div class="ust-section-header">
                            <h2>Profile Details</h2>
                            <button class="ust-btn ust-btn-primary" id="ust-edit-profile-btn">Edit Profile</button>
                        </div>
                        <div id="ust-profile-content">
                            <div class="ust-profile-view">
                                <div class="ust-profile-field">
                                    <label>Username:</label>
                                    <span>${escapeHtml(profile.username)}</span>
                                </div>
                                <div class="ust-profile-field">
                                    <label>Email:</label>
                                    <span>${escapeHtml(profile.email)}</span>
                                </div>
                                <div class="ust-profile-field">
                                    <label>First Name:</label>
                                    <span>${escapeHtml(profile.first_name || 'Not set')}</span>
                                </div>
                                <div class="ust-profile-field">
                                    <label>Last Name:</label>
                                    <span>${escapeHtml(profile.last_name || 'Not set')}</span>
                                </div>
                                <div class="ust-profile-field">
                                    <label>Member Since:</label>
                                    <span>${registered}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Attach edit button listener
                document.getElementById('ust-edit-profile-btn').addEventListener('click', () => {
                    this.renderEditProfile(profile);
                });
                
            } catch (error) {
                container.innerHTML = '<div class="ust-error">Error loading profile</div>';
                console.error('Error:', error);
            }
        }

        renderEditProfile(profile) {
            const contentDiv = document.getElementById('ust-profile-content');
            contentDiv.innerHTML = `
                <form class="ust-profile-form" id="ust-profile-form">
                    <div id="ust-profile-message"></div>
                    <div class="ust-form-group">
                        <label>First Name</label>
                        <input type="text" name="first_name" value="${escapeHtml(profile.first_name || '')}" class="ust-input">
                    </div>
                    <div class="ust-form-group">
                        <label>Last Name</label>
                        <input type="text" name="last_name" value="${escapeHtml(profile.last_name || '')}" class="ust-input">
                    </div>
                    <div class="ust-form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${escapeHtml(profile.email)}" class="ust-input" required>
                    </div>
                    <div class="ust-form-actions">
                        <button type="submit" class="ust-btn ust-btn-primary">Save Changes</button>
                        <button type="button" class="ust-btn ust-btn-secondary" id="ust-cancel-edit">Cancel</button>
                    </div>
                </form>
            `;
            
            // Attach form listener
            document.getElementById('ust-profile-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProfile(new FormData(e.target));
            });
            
            document.getElementById('ust-cancel-edit').addEventListener('click', () => {
                this.switchTab('profile');
            });
        }

        async saveProfile(formData) {
            const messageDiv = document.getElementById('ust-profile-message');
            messageDiv.innerHTML = '';
            
            try {
                const data = {
                    first_name: formData.get('first_name'),
                    last_name: formData.get('last_name'),
                    email: formData.get('email')
                };
                
                const response = await fetch(ustData.apiUrl + '/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': ustData.nonce
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div class="ust-message">Profile updated successfully!</div>';
                    setTimeout(() => this.switchTab('profile'), 1500);
                } else {
                    messageDiv.innerHTML = `<div class="ust-error">${escapeHtml(result.message || 'Error updating profile')}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="ust-error">Error updating profile</div>';
                console.error('Error:', error);
            }
        }

        renderCreateTicket(container) {
            container.innerHTML = `
                <div class="ust-create-ticket-section">
                    <h2>Create Support Ticket</h2>
                    <div id="ust-create-message"></div>
                    <form class="ust-ticket-form" id="ust-create-ticket-form">
                        <div class="ust-form-group">
                            <label>Subject *</label>
                            <input type="text" name="subject" class="ust-input" required placeholder="Brief description of your issue">
                        </div>
                        <div class="ust-form-group">
                            <label>Priority</label>
                            <select name="priority" class="ust-select">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="ust-form-group">
                            <label>Message *</label>
                            <textarea name="message" class="ust-textarea" required rows="6" placeholder="Provide detailed information about your issue..."></textarea>
                        </div>
                        <button type="submit" class="ust-btn ust-btn-primary">Create Ticket</button>
                    </form>
                </div>
            `;
            
            document.getElementById('ust-create-ticket-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.createTicket(new FormData(e.target));
            });
        }

        async createTicket(formData) {
            const messageDiv = document.getElementById('ust-create-message');
            const submitBtn = document.querySelector('#ust-create-ticket-form button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';
            messageDiv.innerHTML = '';
            
            try {
                const data = {
                    subject: formData.get('subject'),
                    message: formData.get('message'),
                    priority: formData.get('priority')
                };
                
                const response = await fetch(ustData.apiUrl + '/tickets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': ustData.nonce
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    messageDiv.innerHTML = '<div class="ust-message">Ticket created successfully!</div>';
                    document.getElementById('ust-create-ticket-form').reset();
                    await this.loadStats();
                    this.render();
                    setTimeout(() => this.switchTab('tickets'), 1500);
                } else {
                    messageDiv.innerHTML = `<div class="ust-error">${escapeHtml(result.message || 'Error creating ticket')}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="ust-error">Error creating ticket</div>';
                console.error('Error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Ticket';
            }
        }

        async renderTickets(container) {
            container.innerHTML = '<div class="ust-loading">Loading tickets...</div>';
            
            try {
                const response = await fetch(ustData.apiUrl + '/tickets', {
                    headers: { 'X-WP-Nonce': ustData.nonce }
                });
                this.tickets = await response.json();
                
                this.renderTicketsList(container);
                
            } catch (error) {
                container.innerHTML = '<div class="ust-error">Error loading tickets</div>';
                console.error('Error:', error);
            }
        }

        renderTicketsList(container, filter = 'all') {
            const filteredTickets = filter === 'all' 
                ? this.tickets 
                : this.tickets.filter(t => t.status === filter);
            
            let ticketsHtml = '';
            
            if (filteredTickets.length === 0) {
                ticketsHtml = '<div class="ust-empty-state"><p>No tickets found.</p></div>';
            } else {
                ticketsHtml = filteredTickets.map(ticket => {
                    const created = new Date(ticket.created_at).toLocaleDateString();
                    const statusClass = this.getStatusClass(ticket.status);
                    const priorityClass = this.getPriorityClass(ticket.priority);
                    const message = ticket.message.substring(0, 150) + (ticket.message.length > 150 ? '...' : '');
                    
                    return `
                        <div class="ust-ticket-card">
                            <div class="ust-ticket-header">
                                <h3>${escapeHtml(ticket.subject)}</h3>
                                <div class="ust-ticket-badges">
                                    <span class="ust-badge ${statusClass}">${escapeHtml(ticket.status.replace('_', ' '))}</span>
                                    <span class="ust-badge ${priorityClass}">${escapeHtml(ticket.priority)}</span>
                                </div>
                            </div>
                            <div class="ust-ticket-body">
                                <p>${escapeHtml(message)}</p>
                            </div>
                            <div class="ust-ticket-footer">
                                <div class="ust-ticket-date">Created: ${created}</div>
                                <div class="ust-ticket-actions">
                                    <button class="ust-btn ust-btn-small ust-btn-secondary" data-ticket-id="${ticket.id}" data-action="view">
                                        View / Reply
                                    </button>
                                    ${ticket.status !== 'closed' ? `
                                        <button class="ust-btn ust-btn-small ust-btn-danger" data-ticket-id="${ticket.id}" data-action="close">
                                            Close
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            container.innerHTML = `
                <div class="ust-tickets-section">
                    <div class="ust-section-header">
                        <h2>My Support Tickets</h2>
                        <div class="ust-filter-buttons">
                            <button class="ust-filter-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                            <button class="ust-filter-btn ${filter === 'open' ? 'active' : ''}" data-filter="open">Open</button>
                            <button class="ust-filter-btn ${filter === 'in_progress' ? 'active' : ''}" data-filter="in_progress">In Progress</button>
                            <button class="ust-filter-btn ${filter === 'closed' ? 'active' : ''}" data-filter="closed">Closed</button>
                        </div>
                    </div>
                    <div class="ust-tickets-list">
                        ${ticketsHtml}
                    </div>
                </div>
            `;
            
            // Attach filter listeners
            container.querySelectorAll('.ust-filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const newFilter = e.target.getAttribute('data-filter');
                    this.renderTicketsList(container, newFilter);
                });
            });
            
            // Attach ticket action listeners
            container.querySelectorAll('[data-action="view"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const ticketId = e.target.getAttribute('data-ticket-id');
                    const ticket = this.tickets.find(t => t.id == ticketId);
                    if (ticket) this.renderTicketView(container, ticket);
                });
            });
            
            container.querySelectorAll('[data-action="close"]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const ticketId = e.target.getAttribute('data-ticket-id');
                    if (confirm('Are you sure you want to close this ticket?')) {
                        await this.closeTicket(ticketId);
                    }
                });
            });
        }

        async closeTicket(ticketId) {
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
                    await this.loadStats();
                    this.render();
                    this.switchTab('tickets');
                }
            } catch (error) {
                console.error('Error closing ticket:', error);
                alert('Error closing ticket');
            }
        }

        async renderTicketView(container, ticket) {
            container.innerHTML = '<div class="ust-loading">Loading ticket details...</div>';
            
            try {
                const response = await fetch(ustData.apiUrl + '/tickets/' + ticket.id + '/replies', {
                    headers: { 'X-WP-Nonce': ustData.nonce }
                });
                const replies = await response.json();
                
                const created = new Date(ticket.created_at).toLocaleDateString();
                const statusClass = this.getStatusClass(ticket.status);
                const priorityClass = this.getPriorityClass(ticket.priority);
                
                let repliesHtml = '';
                if (replies.length === 0) {
                    repliesHtml = '<p class="ust-no-replies">No replies yet.</p>';
                } else {
                    repliesHtml = replies.map(reply => {
                        const replyDate = new Date(reply.created_at).toLocaleString();
                        const adminClass = reply.is_admin_reply == 1 ? 'ust-admin-reply' : '';
                        return `
                            <div class="ust-reply ${adminClass}">
                                <div class="ust-reply-header">
                                    <strong>${escapeHtml(reply.user_name)}</strong>
                                    ${reply.is_admin_reply == 1 ? '<span class="ust-admin-badge">Admin</span>' : ''}
                                    <span class="ust-reply-date">${replyDate}</span>
                                </div>
                                <div class="ust-reply-body">
                                    <p>${escapeHtml(reply.message)}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
                
                container.innerHTML = `
                    <div class="ust-ticket-replies-view">
                        <div class="ust-replies-header">
                            <button class="ust-btn ust-btn-secondary" id="ust-back-to-tickets">← Back to Tickets</button>
                        </div>
                        <div class="ust-ticket-detail">
                            <h2>${escapeHtml(ticket.subject)}</h2>
                            <div class="ust-ticket-meta">
                                <span class="ust-badge ${statusClass}">${escapeHtml(ticket.status.replace('_', ' '))}</span>
                                <span class="ust-badge ${priorityClass}">${escapeHtml(ticket.priority)} priority</span>
                                <span>Created: ${created}</span>
                            </div>
                            <div class="ust-ticket-message">
                                <p>${escapeHtml(ticket.message)}</p>
                            </div>
                        </div>
                        <div class="ust-replies-section">
                            <h3>Replies</h3>
                            <div class="ust-replies-list">${repliesHtml}</div>
                            ${ticket.status !== 'closed' ? `
                                <form class="ust-reply-form" id="ust-reply-form">
                                    <h4>Add Reply</h4>
                                    <div id="ust-reply-message"></div>
                                    <textarea name="message" class="ust-textarea" rows="4" placeholder="Type your reply..." required></textarea>
                                    <button type="submit" class="ust-btn ust-btn-primary">Send Reply</button>
                                </form>
                            ` : ''}
                        </div>
                    </div>
                `;
                
                document.getElementById('ust-back-to-tickets').addEventListener('click', () => {
                    this.switchTab('tickets');
                });
                
                if (ticket.status !== 'closed') {
                    document.getElementById('ust-reply-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        await this.addReply(ticket.id, new FormData(e.target));
                    });
                }
                
            } catch (error) {
                container.innerHTML = '<div class="ust-error">Error loading ticket details</div>';
                console.error('Error:', error);
            }
        }

        async addReply(ticketId, formData) {
            const messageDiv = document.getElementById('ust-reply-message');
            const submitBtn = document.querySelector('#ust-reply-form button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            messageDiv.innerHTML = '';
            
            try {
                const data = { message: formData.get('message') };
                
                const response = await fetch(ustData.apiUrl + '/tickets/' + ticketId + '/replies', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': ustData.nonce
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    const ticket = this.tickets.find(t => t.id == ticketId);
                    if (ticket) {
                        await this.loadStats();
                        this.render();
                        this.renderTicketView(document.getElementById('ust-tab-content'), ticket);
                    }
                } else {
                    const result = await response.json();
                    messageDiv.innerHTML = `<div class="ust-error">${escapeHtml(result.message || 'Error adding reply')}</div>`;
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="ust-error">Error adding reply</div>';
                console.error('Error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Reply';
            }
        }

        getStatusClass(status) {
            switch(status) {
                case 'open': return 'ust-badge-open';
                case 'in_progress': return 'ust-badge-progress';
                case 'closed': return 'ust-badge-closed';
                default: return '';
            }
        }

        getPriorityClass(priority) {
            switch(priority) {
                case 'high': return 'ust-badge-high';
                case 'medium': return 'ust-badge-medium';
                case 'low': return 'ust-badge-low';
                default: return '';
            }
        }
    }

})();
