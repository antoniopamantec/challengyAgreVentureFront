import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layers, User, Mail, Briefcase, Lock, ArrowLeft } from "lucide-react";

import "./RegisterUser.css";

const RegisterUser = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    perfil: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setErro("");

      const res = await axios.post("http://localhost:3000/utilizador/", values);

      console.log(res.data);
      navigate("/login");
    } catch (error) {
      console.error("Erro:", error.response?.data || error);
      console.error("Erro:", error.response?.data || error);

      const detalhes = error.response?.data?.details;

      if (Array.isArray(detalhes) && detalhes.length > 0) {
        setErro(
          detalhes.map((item) => ({
            field: item.field,
            message: item.message,
          })),
        );
      } else {
        setErro([
          {
            field: "",
            message:
              error.response?.data?.message ||
              error.response?.data?.error ||
              "Ocorreu um erro inesperado.",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* LOGO */}

        <div className="register-logo">
          <div className="register-logo-icon">
            <Layers size={26} />
          </div>

          <span>NEXUS CRM</span>
        </div>

        {/* HEADER */}

        <div className="register-header">
          <h1>Criar conta</h1>

          <p>Preenche os teus dados para criar uma nova conta.</p>
        </div>

        {/* ERROR */}

        {erro.length > 0 && (
          <div
            role="alert"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "16px 18px",
              marginBottom: "22px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderLeft: "4px solid #e11d48",
              borderRadius: "10px",
              color: "#9f1239",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                fontWeight: "700",
                color: "#be123c",
              }}
            >
              <span>⚠️</span>
              Erro de validação
            </div>

            {erro.map((item, index) => (
              <div
                key={index}
                style={{
                  paddingLeft: "27px",
                  lineHeight: "1.6",
                }}
              >
                <strong style={{ textTransform: "capitalize" }}>
                  {item.field}:
                </strong>{" "}
                {item.message}
              </div>
            ))}
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="register-field">
            <label htmlFor="name">Nome completo</label>

            <div className="register-input-wrapper">
              <User size={18} />

              <input
                type="text"
                id="name"
                name="name"
                placeholder="O teu nome"
                value={values.name}
                onChange={(e) =>
                  setValues({
                    ...values,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="email">Email</label>

            <div className="register-input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                id="email"
                name="email"
                placeholder="exemplo@email.com"
                value={values.email}
                onChange={(e) =>
                  setValues({
                    ...values,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="perfil">Perfil</label>

            <div className="register-input-wrapper">
              <Briefcase size={18} />

              <input
                type="text"
                id="perfil"
                name="perfil"
                placeholder="Ex: Administrator"
                value={values.perfil}
                onChange={(e) =>
                  setValues({
                    ...values,
                    perfil: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>

            <div className="register-input-wrapper">
              <Lock size={18} />

              <input
                type="password"
                id="password"
                name="password"
                placeholder="Introduz uma password"
                value={values.password}
                onChange={(e) =>
                  setValues({
                    ...values,
                    password: e.target.value,
                  })
                }
                required
                minLength={8}
              />
            </div>

            <small>Utiliza pelo menos 8 caracteres.</small>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "A criar conta..." : "Criar conta"}
          </button>
        </form>

        {/* FOOTER */}

        <div className="register-footer">
          <span>Já tens uma conta?</span>

          <Link to="/login">Iniciar sessão</Link>
        </div>

        <Link to="/" className="register-back">
          <ArrowLeft size={15} />
          Voltar ao início
        </Link>
      </div>

      <div className="register-copyright">
        © 2026 Nexus CRM. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default RegisterUser;
