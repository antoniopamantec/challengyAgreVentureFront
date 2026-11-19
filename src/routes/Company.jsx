import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/company";

const emptyForm = {
  name: "",
};

function Company() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [erro, setErro] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // PAGINATION
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // ERROR HANDLING
  const obterErro = (error) => {
    const details = error.response?.data?.details;

    if (Array.isArray(details)) {
      return details.map((item) => item.message);
    }

    return [
      details?.message ||
        error.response?.data?.message ||
        error.message ||
        "Ocorreu um erro inesperado.",
    ];
  };

  // GET: LIST COMPANIES
  const buscarCompanies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setErro("");

      const response = await axios.get(`${API_URL}?page=${page}`);

      const data = response.data;

      const lista = Array.isArray(data) ? data : data.companies;

      if (!Array.isArray(lista)) {
        throw new Error("Formato de resposta inválido.");
      }

      setCompanies(lista);

      setPaginaAtual(data.currentPage || page);
      setTotalPaginas(data.totalPages || 1);
      setTotalCompanies(data.total ?? lista.length);
    } catch (error) {
      setErro(obterErro(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarCompanies(1);
  }, [buscarCompanies]);

  // SEARCH
  const companiesFiltradas = companies.filter((item) =>
    (item.name || "").toLowerCase().includes(pesquisa.toLowerCase()),
  );

  // FORM CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN CREATE
  const abrirCriacao = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setErro("");
    setShowForm(true);
  };

  // OPEN EDIT
  const abrirEdicao = (company) => {
    setForm({
      name: company.name || "",
    });

    setEditingId(company.id);
    setErro("");
    setShowForm(true);
  };

  // CREATE / UPDATE
  const guardarCompany = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setErro("");

      const payload = {
        name: form.name.trim(),
      };

      if (!payload.name) {
        setErro(["Company name is required."]);
        return;
      }

      if (editingId !== null) {
        await axios.patch(`${API_URL}/${editingId}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }

      setShowForm(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await buscarCompanies(paginaAtual);
    } catch (error) {
      setErro(obterErro(error));
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const eliminarCompany = async (id) => {
    const confirmar = window.confirm(
      "Tens a certeza de que pretendes eliminar esta empresa?",
    );

    if (!confirmar) return;

    try {
      setDeletingId(id);
      setErro("");

      await axios.delete(`${API_URL}/${id}`);

      const pagina =
        companies.length === 1 && paginaAtual > 1
          ? paginaAtual - 1
          : paginaAtual;

      await buscarCompanies(pagina);
    } catch (error) {
      setErro(obterErro(error));
    } finally {
      setDeletingId(null);
    }
  };

  // CLOSE FORM
  const fecharFormulario = () => {
    if (saving) return;

    setShowForm(false);
    setForm({ ...emptyForm });
    setEditingId(null);
    setErro("");
  };

  return (
    <main style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Companies</h1>
          <p style={styles.subtitle}>Company Management System</p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.secondaryButton}
            onClick={() => buscarCompanies(paginaAtual)}
            disabled={loading}
          >
            Refresh
          </button>

          <button style={styles.primaryButton} onClick={abrirCriacao}>
            + Create Company
          </button>
        </div>
      </header>

      {/* ERRORS */}
      {erro.length > 0 && (
        <div style={styles.error}>
          {erro.map((message, index) => (
            <div key={index}>• {message}</div>
          ))}
        </div>
      )}

      {/* STATISTICS */}
      <section style={styles.cards}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>Total Companies</span>

          <h2 style={styles.cardNumber}>{totalCompanies}</h2>
        </div>
      </section>

      {/* COMPANY MANAGEMENT */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Company Management</h2>

        {/* SEARCH */}
        <div style={styles.filters}>
          <input
            style={styles.input}
            type="search"
            placeholder="Search company..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Company Name</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" style={styles.emptyRow}>
                    Loading companies...
                  </td>
                </tr>
              ) : companiesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="3" style={styles.emptyRow}>
                    No companies found.
                  </td>
                </tr>
              ) : (
                companiesFiltradas.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>#{item.id}</td>

                    <td style={styles.td}>
                      <strong>{item.name}</strong>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.editButton}
                          onClick={() => abrirEdicao(item)}
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteButton}
                          onClick={() => eliminarCompany(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {!loading && companiesFiltradas.length > 0 && (
            <div style={styles.pagination}>
              <span style={styles.paginationInfo}>
                Page {paginaAtual} of {totalPaginas}
                {" | "}
                {totalCompanies} companies
              </span>

              <div style={styles.paginationButtons}>
                <button
                  style={styles.pageButton}
                  disabled={paginaAtual <= 1 || loading}
                  onClick={() => buscarCompanies(paginaAtual - 1)}
                >
                  Previous
                </button>

                <button
                  style={styles.pageButton}
                  disabled={paginaAtual >= totalPaginas || loading}
                  onClick={() => buscarCompanies(paginaAtual + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div style={styles.overlay}>
          <form style={styles.form} onSubmit={guardarCompany}>
            <h2 style={styles.formTitle}>
              {editingId !== null ? "Edit Company" : "Create Company"}
            </h2>

            {erro.length > 0 && (
              <div style={styles.error}>
                {erro.map((message, index) => (
                  <div key={index}>• {message}</div>
                ))}
              </div>
            )}

            <label>Company Name</label>

            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Enter company name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={fecharFormulario}
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
                  : editingId !== null
                    ? "Save Changes"
                    : "Create Company"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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

  filters: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    boxSizing: "border-box",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    minWidth: "500px",
  },

  th: {
    padding: "14px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "13px",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "14px",
  },

  emptyRow: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b",
  },

  actions: {
    display: "flex",
    gap: "8px",
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
    padding: "7px 12px",
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "7px 12px",
    background: "#fee2e2",
    color: "#b91c1c",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    padding: "18px 10px",
    borderTop: "1px solid #e2e8f0",
  },

  paginationInfo: {
    fontSize: "13px",
    color: "#64748b",
  },

  paginationButtons: {
    display: "flex",
    gap: "8px",
  },

  pageButton: {
    padding: "9px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
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
    boxSizing: "border-box",
  },

  formTitle: {
    marginTop: 0,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "15px",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
  },
};

export default Company;
