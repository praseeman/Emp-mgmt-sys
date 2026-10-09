import React, { useState } from "react";
import "./SupportModal.css";

const FAQS = [
  {
    q: "How do I add a new employee?",
    a: "Navigate to the 'Employees' tab from the sidebar and click the '+ Add Employee' button at the top right. Enter the employee's name, email, department, designation, salary, and status, then click 'Add Employee'.",
    cat: "Employees",
  },
  {
    q: "How do I edit or delete existing employee records?",
    a: "In the Employees table, locate the employee row. Click the 'Edit' button to update their profile information, or click 'Delete' to permanently remove them after confirmation.",
    cat: "Employees",
  },
  {
    q: "How does Attendance tracking work?",
    a: "Click on 'Attendance' in the sidebar to view today's attendance logs. All active employees are marked with their check-in and check-out times and current presence status.",
    cat: "Attendance",
  },
  {
    q: "How do I approve or reject Leave Requests?",
    a: "Open 'Leave Requests' from the sidebar menu. For any pending leave request, click the green checkmark (✓) to approve or the red cross (✕) to reject immediately.",
    cat: "Leave",
  },
  {
    q: "How is the monthly Payroll calculated?",
    a: "In the 'Payroll' section, net salary is calculated with base salary plus 10% standard allowances minus 5% deductions. You can view individual monthly breakdowns for all employees.",
    cat: "Payroll",
  },
  {
    q: "How do I configure notifications or change admin settings?",
    a: "Go to the 'Settings' page or click your profile avatar at the top right corner. You can configure notification toggles, inspect organization departments, and manage admin credentials.",
    cat: "Settings",
  },
];

export default function SupportModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState("faqs"); // 'faqs' | 'ticket' | 'contact'
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Ticket Form State
  const [ticketData, setTicketData] = useState({
    name: user?.name || "Administrator",
    email: user?.email || "sppraseeman@gmail.com",
    category: "Technical Issue",
    priority: "Medium",
    subject: "",
    message: "",
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketData.subject.trim() || !ticketData.message.trim()) {
      alert("Please enter both a subject and a message description.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `EMS-${Math.floor(10000 + Math.random() * 90000)}`;
      setTicketId(generatedId);
      setIsSubmitting(false);
      setTicketSubmitted(true);
    }, 600);
  };

  const handleResetTicket = () => {
    setTicketData({
      name: user?.name || "Administrator",
      email: user?.email || "sppraseeman@gmail.com",
      category: "Technical Issue",
      priority: "Medium",
      subject: "",
      message: "",
    });
    setTicketSubmitted(false);
    setTicketId("");
  };

  return (
    <div className="support-modal-overlay" onMouseDown={onClose}>
      <div
        className="support-modal-card"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="support-modal-header">
          <div className="support-header-left">
            <div className="support-icon-badge">💡</div>
            <div>
              <h2>Help & Support Center</h2>
              <p>Get instant answers, submit a ticket, or reach our support team</p>
            </div>
          </div>

          <button
            type="button"
            className="support-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="support-tabs">
          <button
            type="button"
            className={`support-tab-btn ${activeTab === "faqs" ? "active" : ""}`}
            onClick={() => setActiveTab("faqs")}
          >
            <span>❓</span> FAQs & Guides
          </button>
          <button
            type="button"
            className={`support-tab-btn ${activeTab === "ticket" ? "active" : ""}`}
            onClick={() => setActiveTab("ticket")}
          >
            <span>✉️</span> Submit a Ticket
          </button>
          <button
            type="button"
            className={`support-tab-btn ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            <span>📞</span> Direct Contact
          </button>
        </div>

        {/* TAB 1: FAQS */}
        {activeTab === "faqs" && (
          <div className="support-tab-body">
            <div className="support-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search common questions, guide topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="faq-list">
              {filteredFaqs.length === 0 ? (
                <div className="faq-empty">
                  <span>🔎</span>
                  <h4>No questions matched "{searchQuery}"</h4>
                  <p>Try different keywords or submit a ticket to get personalized help.</p>
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const isExpanded = expandedFaq === index;
                  return (
                    <div
                      key={faq.q}
                      className={`faq-item ${isExpanded ? "expanded" : ""}`}
                    >
                      <button
                        type="button"
                        className="faq-question-btn"
                        onClick={() =>
                          setExpandedFaq(isExpanded ? null : index)
                        }
                      >
                        <div className="faq-title-wrap">
                          <span className="faq-cat-badge">{faq.cat}</span>
                          <span className="faq-q-text">{faq.q}</span>
                        </div>
                        <span className="faq-arrow">{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      {isExpanded && (
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TICKET SUBMISSION */}
        {activeTab === "ticket" && (
          <div className="support-tab-body">
            {ticketSubmitted ? (
              <div className="ticket-success-card">
                <div className="ticket-success-icon">✓</div>
                <h3>Support Request Submitted!</h3>
                <p>
                  Your ticket reference is <strong>#{ticketId}</strong>. A support
                  specialist will review your issue and reach out to{" "}
                  <strong>{ticketData.email}</strong> shortly.
                </p>

                <div className="ticket-summary-box">
                  <div>
                    <span>Subject:</span>
                    <strong>{ticketData.subject}</strong>
                  </div>
                  <div>
                    <span>Category:</span>
                    <strong>{ticketData.category}</strong>
                  </div>
                  <div>
                    <span>Priority:</span>
                    <strong>{ticketData.priority}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="ticket-new-btn"
                  onClick={handleResetTicket}
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form className="ticket-form" onSubmit={handleTicketSubmit}>
                <div className="ticket-grid">
                  <div className="ticket-field">
                    <label>Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={ticketData.name}
                      onChange={handleTicketChange}
                      required
                    />
                  </div>

                  <div className="ticket-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={ticketData.email}
                      onChange={handleTicketChange}
                      required
                    />
                  </div>

                  <div className="ticket-field">
                    <label>Issue Category</label>
                    <select
                      name="category"
                      value={ticketData.category}
                      onChange={handleTicketChange}
                    >
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Employee Record Query">
                        Employee Record Query
                      </option>
                      <option value="Payroll & Salary Discrepancy">
                        Payroll & Salary Discrepancy
                      </option>
                      <option value="Attendance Tracking">
                        Attendance Tracking
                      </option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Support">General Support</option>
                    </select>
                  </div>

                  <div className="ticket-field">
                    <label>Priority Level</label>
                    <select
                      name="priority"
                      value={ticketData.priority}
                      onChange={handleTicketChange}
                    >
                      <option value="Low">Low - General Question</option>
                      <option value="Medium">Medium - Normal Priority</option>
                      <option value="High">High - Urgent Assistance</option>
                    </select>
                  </div>
                </div>

                <div className="ticket-field full-width">
                  <label>Subject / Summary *</label>
                  <input
                    type="text"
                    name="subject"
                    value={ticketData.subject}
                    onChange={handleTicketChange}
                    placeholder="Brief description of the problem..."
                    required
                  />
                </div>

                <div className="ticket-field full-width">
                  <label>Detailed Message *</label>
                  <textarea
                    rows="4"
                    name="message"
                    value={ticketData.message}
                    onChange={handleTicketChange}
                    placeholder="Describe what happened and how we can assist you..."
                    required
                  ></textarea>
                </div>

                <div className="ticket-footer-actions">
                  <button
                    type="button"
                    className="ticket-cancel-btn"
                    onClick={() => setActiveTab("faqs")}
                  >
                    Back to FAQs
                  </button>

                  <button
                    type="submit"
                    className="ticket-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Send Support Request →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CONTACT CHANNELS */}
        {activeTab === "contact" && (
          <div className="support-tab-body">
            <div className="contact-cards-grid">
              {/* Phone Card */}
              <div className="contact-channel-card">
                <div className="channel-icon phone">📞</div>
                <div className="channel-details">
                  <h4>Phone Support</h4>
                  <p>Speak directly with an administrator or technician</p>
                  <strong>+91 82480 70608</strong>
                  <span className="channel-hours">Mon - Sat: 9:00 AM - 7:00 PM IST</span>
                </div>
                <a
                  href="tel:+918248070608"
                  className="channel-action-btn phone-btn"
                >
                  Call Now
                </a>
              </div>

              {/* Email Card */}
              <div className="contact-channel-card">
                <div className="channel-icon email">✉️</div>
                <div className="channel-details">
                  <h4>Email Support</h4>
                  <p>Send detailed queries and logs to our support desk</p>
                  <strong>sppraseeman@gmail.com</strong>
                  <span className="channel-hours">Typical response time: &lt; 2 hours</span>
                </div>
                <a
                  href="mailto:sppraseeman@gmail.com?subject=Employee%20Management%20Support%20Request"
                  className="channel-action-btn email-btn"
                >
                  Compose Email
                </a>
              </div>

              {/* Live Hours Card */}
              <div className="contact-channel-card">
                <div className="channel-icon office">🏢</div>
                <div className="channel-details">
                  <h4>System Administration</h4>
                  <p>EMS Operations & Corporate Infrastructure</p>
                  <strong>Employee Management HQ</strong>
                  <span className="channel-hours">Status: All Systems Operational ✓</span>
                </div>
                <button
                  type="button"
                  className="channel-action-btn copy-btn"
                  onClick={() => {
                    alert("Support Desk: sppraseeman@gmail.com | Phone: +91 82480 70608");
                  }}
                >
                  Quick Info
                </button>
              </div>
            </div>

            <div className="support-service-note">
              <span>⚡</span>
              <div>
                <strong>Need immediate critical resolution?</strong>
                <p>Call our hotline above or submit a High priority ticket for swift handling.</p>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="support-modal-footer">
          <div className="support-footer-note">
            <span>🛡️</span> 24/7 Dedicated Support Assistance
          </div>
          <button type="button" className="support-close-action" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
