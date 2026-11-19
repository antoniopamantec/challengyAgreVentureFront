import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  CircleHelp,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Layers,
} from "lucide-react";

import "./CRMLayout.css";
import axios from "axios";

import { useEffect, useMemo, useState, useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import AuthContext from "./context/AuthProvider";

const API_URL = "http://localhost:3000/lead";

const STATUS_OPTIONS = ["New", "Contacted", "Qualified", "Lost"];

const emptyForm = {
  name: "",
  email: "",
  company: "",
  companyId: "",
  status: "New",
};

const menuItems = [
  {
    title: "MAIN MENU",
    items: [
      { name: "Overview", path: "/", icon: LayoutDashboard },
      { name: "Leads", path: "/leads", icon: Users },
      { name: "Companies", path: "/company", icon: Building2 },
      { name: "Pipeline", path: "/pipeline", icon: Kanban },
      { name: "Activities", path: "/activities", icon: CalendarDays },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Reports", path: "/reports", icon: ChartNoAxesCombined },
      { name: "Settings", path: "/settings", icon: Settings },
      { name: "Help Center", path: "/help", icon: CircleHelp },
    ],
  },
];

function CRMLayout() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Utilizador autenticado
  const utilizador = auth?.user;
  //console.log(auth.user.accessToken);
  const nome = utilizador?.nome || utilizador?.name || "Utilizador";
  const funcao = utilizador?.funcao || utilizador?.role || "Utilizador";

  // Gerar iniciais
  const iniciais = nome
    .split(" ")
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      const accessToken = auth.user.accessToken;

      if (!accessToken) {
        throw new Error("Token de autenticação não encontrado.");
      }

      await axios.get("http://localhost:3000/utilizador/logout", {
        headers: {
          Authorization: `${accessToken}`,
        },
      });

      console.log("Logout realizado com sucesso.");
    } catch (error) {
      console.error("Erro no logout:", error.response?.data || error.message);
    } finally {
      setAuth({
        user: null,
        email: "",
        accessToken: null,
        isAuthenticated: false,
      });

      localStorage.removeItem("accessToken");

      navigate("/login", { replace: true });
    }
  };

  // Restante código...
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // GET: buscar todos os leads

  const buscarLeads = async (page = paginaAtual) => {
    try {
      setLoading(true);
      setErro("");

      const response = await axios.get(`${API_URL}?page=${page}`);

      const data = response.data;

      const lista = Array.isArray(data) ? data : data.leads;

      if (!Array.isArray(lista)) {
        throw new Error("Formato de resposta inválido.");
      }

      setLeads(lista);
      setTotalPaginas(data.totalPages || 1);
      setPaginaAtual(data.currentPage || page);
    } catch (error) {
      console.error("Erro ao buscar leads:", error);

      const detalhes = error.response?.data?.details;

      setErro(
        Array.isArray(detalhes)
          ? detalhes.map((item) => item.message).join("\n")
          : detalhes?.message ||
              error.response?.data?.message ||
              error.message ||
              "Não foi possível carregar os leads.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarLeads();
  }, []);

  const [company, setCompany] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:3000/company/")
      .then((res) => setCompany(res.data))
      .catch((err) => console.log(err));
  }, []);

  const [leadsNopage, setLeadsNopage] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:3000/lead/nopage")
      .then((res) => setLeadsNopage(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Indicadores por estado
  const statusCounts = useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      status,
      total: leadsNopage.filter((lead) => lead.status === status).length,
    }));
  }, [leadsNopage]);

  // Pesquisa e filtro
  const leadsFiltrados = useMemo(() => {
    return leadsNopage.filter((lead) => {
      const termo = pesquisa.toLowerCase();

      const correspondePesquisa =
        (lead.name || "").toLowerCase().includes(termo) ||
        (lead.email || "").toLowerCase().includes(termo);

      const correspondeStatus =
        filtroStatus === "All" || lead.status === filtroStatus;

      return correspondePesquisa && correspondeStatus;
    });
  }, [leads, pesquisa, filtroStatus]);

  // Leads recentemente criados
  const leadsRecentes = useMemo(() => {
    return [...leadsNopage]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();

        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [leads]);

  // Atualizar campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Abrir formulário para criar
  const abrirCriacao = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  // Abrir formulário para editar
  const abrirEdicao = (lead) => {
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      company: lead.company.name,
      companyId: lead.company.id,
      status: lead.status || "New",
    });

    setEditingId(lead.id);
    setShowForm(true);
  };

  // POST / PUT: criar ou editar

  const guardarLead = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setErro("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        companyId: form.companyId,
        status: form.status,
      };

      if (editingId !== null) {
        // PATCH: editar lead
        await axios.patch(`${API_URL}/${editingId}`, payload);
      } else {
        // POST: criar lead
        await axios.post(API_URL, payload);
      }

      await buscarLeads();

      setShowForm(false);
      setForm(emptyForm);
    } catch (error) {
      console.error("Erro:", error.response?.data || error);

      const detalhes = error.response?.data?.details;

      if (Array.isArray(detalhes)) {
        setErro(detalhes.map((item) => item.message));
      } else {
        setErro([
          detalhes?.message || error.response?.data?.message || error.message,
        ]);
      }
    } finally {
      setSaving(false);
    }
  };

  // DELETE: eliminar lead
  const eliminarLead = async (id) => {
    const confirmar = window.confirm(
      "Tens a certeza de que pretendes eliminar este lead?",
    );

    if (!confirmar) return;

    await axios
      .delete("http://localhost:3000/lead/" + id)
      .then((res) => {
        console.log(res);
        location.reload();
      })
      .catch((err) => console.log(err));
  };

  const formatarData = (lead) => {
    const date = lead.createdAt || lead.created_at;

    if (!date) return "Data indisponível";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Data indisponível";
    }

    return parsed.toLocaleDateString("pt-PT");
  };

  const nomeEmpresa = (lead) => {
    if (typeof lead.company === "object") {
      return lead.company?.name || "-";
    }

    return lead.company || "-";
  };
  return (
    <div className="crm-layout">
      {/* SIDEBAR */}
      <aside className={`crm-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="crm-logo">
          <div className="logo-icon">
            <Layers size={23} />
          </div>

          <span>CHALLENGY CRM</span>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {menuItems.map((group) => (
            <div className="menu-group" key={group.title}>
              <p className="menu-title">{group.title}</p>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={19} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* USER PROFILE */}
        <div className="sidebar-profile">
          <div className="profile-avatar">{iniciais}</div>

          <div className="profile-info">
            <strong>{nome}</strong>
            <span>{funcao}</span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Terminar sessão"
            aria-label="Terminar sessão"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="crm-main">
        {/* TOPBAR */}
        <header className="crm-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={23} />
            </button>

            <div className="breadcrumb">
              <span>CRM</span>
              <span>/</span>
              <strong>Dashboard</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div style={styles.headerActions}>
              <button
                style={styles.secondaryButton}
                onClick={buscarLeads}
                disabled={loading}
              >
                Refresh
              </button>

              <button style={styles.primaryButton} onClick={abrirCriacao}>
                + Create Lead
              </button>
            </div>

            <button className="notification-button">
              <Bell size={20} />
              <span className="notification-dot" />
            </button>

            <div className="topbar-user">
              <div className="profile-avatar">{iniciais}</div>

              <div className="topbar-user-info">
                <strong>{nome}</strong>
                <span>{funcao}</span>
              </div>

              <button
                type="button"
                className="topbar-logout"
                onClick={handleLogout}
                title="Terminar sessão"
                aria-label="Terminar sessão"
              >
                <LogOut size={19} />
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="crm-content">
          <Outlet />

          {erro && (
            <div style={styles.error}>
              {Array.isArray(erro) ? (
                erro.map((mensagem, index) => (
                  <div key={index} style={{ marginBottom: "5px" }}>
                    • {mensagem}
                  </div>
                ))
              ) : (
                <div>{erro}</div>
              )}
            </div>
          )}

          {/* GENERAL STATISTICS */}
          <section style={styles.cards}>
            <div style={styles.card}>
              <span style={styles.cardLabel}>Total Leads</span>
              <h2 style={styles.cardNumber}>{leads.length}</h2>
            </div>

            {statusCounts.map((item) => (
              <div style={styles.card} key={item.status}>
                <span style={styles.cardLabel}>{item.status}</span>
                <h2 style={styles.cardNumber}>{item.total}</h2>
              </div>
            ))}
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Recently Created Leads</h2>

            {leadsRecentes.length === 0 ? (
              <p>No recent leads.</p>
            ) : (
              <div style={styles.recentGrid}>
                {leadsRecentes.map((lead) => (
                  <div key={lead.id} style={styles.recentCard}>
                    <strong>{lead.name}</strong>
                    <span>{lead.email}</span>
                    <small>{formatarData(lead)}</small>
                    <span style={styles.status}>
                      {lead.status || "No status"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* LEAD MANAGEMENT */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Lead Management</h2>

            <div style={styles.filters}>
              <input
                style={styles.input}
                type="search"
                placeholder="Search by name or email..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />

              <select
                style={styles.input}
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="All">All statuses</option>

                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <p>Loading leads...</p>
            ) : leadsFiltrados.length === 0 ? (
              <p>No leads found.</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Company</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Created</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leadsFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={styles.td}>
                          No leads found.
                        </td>
                      </tr>
                    ) : (
                      leadsFiltrados.map((lead) => (
                        <tr key={lead.id}>
                          <td style={styles.td}>{lead.id}</td>
                          <td style={styles.td}>{lead.name}</td>
                          <td style={styles.td}>{lead.email}</td>
                          <td style={styles.td}>{nomeEmpresa(lead)}</td>

                          <td style={styles.td}>
                            <span style={styles.status}>
                              {lead.status || "No status"}
                            </span>
                          </td>

                          <td style={styles.td}>{formatarData(lead)}</td>

                          <td style={styles.td}>
                            <div style={styles.actions}>
                              <button
                                type="button"
                                style={styles.editButton}
                                onClick={() => abrirEdicao(lead)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                style={styles.deleteButton}
                                onClick={() => eliminarLead(lead.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* PAGINATION */}
                <div style={styles.pagination}>
                  <button
                    type="button"
                    disabled={paginaAtual <= 1 || loading}
                    onClick={() => buscarLeads(paginaAtual - 1)}
                    style={styles.pageButton}
                  >
                    Previous
                  </button>

                  <span style={styles.paginationInfo}>
                    Page {paginaAtual} of {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaAtual >= totalPaginas || loading}
                    onClick={() => buscarLeads(paginaAtual + 1)}
                    style={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* CREATE / EDIT FORM */}
          {showForm && (
            <div style={styles.overlay}>
              <form style={styles.form} onSubmit={guardarLead}>
                <h2>{editingId ? "Edit Lead" : "Create Lead"}</h2>

                <label>Name</label>
                <input
                  style={styles.input}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <label>Email</label>
                <input
                  style={styles.input}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <label>Company</label>

                <select
                  style={styles.input}
                  name="companyId"
                  value={form.companyId}
                  onChange={handleChange}
                >
                  <option value="">Select Company</option>

                  {company.map((data) => (
                    <option key={data.id} value={String(data.id)}>
                      {data.name}
                    </option>
                  ))}
                </select>

                <label>Status</label>
                <select
                  style={styles.input}
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <div style={styles.formActions}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={styles.primaryButton}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Create Lead"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "50px",
    background: "#f8fafc",
    color: "#1e293b",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "30px",
  },

  title: {
    marginTop: "40px",
    fontSize: "30px",
    margin: 0,
  },

  subtitle: {
    color: "#64748b",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  cardLabel: {
    color: "#64748b",
    fontSize: "14px",
  },

  cardNumber: {
    fontSize: "28px",
    marginBottom: 0,
  },

  section: {
    background: "#fff",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "25px",
  },

  sectionTitle: {
    fontSize: "20px",
    marginTop: 0,
    marginBottom: "20px",
  },

  recentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
  },

  recentCard: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    overflowWrap: "anywhere",
  },

  filters: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  input: {
    padding: "11px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    minWidth: "180px",
    boxSizing: "border-box",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },

  th: {
    padding: "13px",
    background: "#f1f5f9",
    color: "#475569",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px",
    borderBottom: "1px solid #e2e8f0",
  },

  status: {
    display: "inline-block",
    padding: "5px 9px",
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "20px",
    fontSize: "12px",
  },

  actions: {
    display: "flex",
    gap: "6px",
  },

  primaryButton: {
    padding: "11px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "11px 16px",
    background: "#e2e8f0",
    color: "#334155",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },

  editButton: {
    padding: "7px 10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "7px 10px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "15px",
    zIndex: 1000,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "12px",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderTop: "1px solid #e2e8f0",
    background: "#fff",
  },

  paginationInfo: {
    color: "#64748b",
    fontSize: "14px",
  },

  pageButton: {
    padding: "9px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
  },
};

export default CRMLayout;
