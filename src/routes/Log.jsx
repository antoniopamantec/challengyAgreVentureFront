import React, { useContext, useEffect, useState, useRef } from "react";

import axios from "axios";
import AuthContext from "./context/AuthProvider";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import "./Log.css";

const Log = () => {
  const { setAuth } = useContext(AuthContext);

  const userRef = useRef(null);
  const errRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const destino = location.state?.from?.pathname || "/crm";
  // Estados inicializados com strings vazias
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrMsg("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      setErrMsg("");

      const response = await axios.post(
        "http://localhost:3000/utilizador/login",
        {
          email: email.trim(),
          password,
        },
      );

      // Atualizar autenticação
      setAuth({
        user: response.data.user || response.data,
        email: email.trim(),
        isAuthenticated: true,
      });

      setEmail("");
      setPassword("");

      navigate(destino, { replace: true });
    } catch (error) {
      console.error("Erro no login:", error.response?.data || error);

      const resposta = error.response?.data;
      const detalhes = resposta?.details;

      if (Array.isArray(detalhes) && detalhes.length > 0) {
        setErrMsg(detalhes.map((item) => item.message).join(" "));
      } else {
        setErrMsg(
          resposta?.message ||
            resposta?.error ||
            "Email ou password inválidos.",
        );
      }

      errRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* LOGO */}

        <div className="login-logo">
          <div className="login-logo-icon">
            <Layers size={26} />
          </div>

          <span>NEXUS CRM</span>
        </div>

        {/* HEADER */}

        <div className="login-header">
          <h1>Bem-vindo de volta!</h1>

          <p>Entre na sua conta para continuar.</p>
        </div>

        {/* ERROR */}

        {errMsg && (
          <div ref={errRef} className="login-error" role="alert" tabIndex="-1">
            <AlertCircle size={19} />

            <span>{errMsg}</span>
          </div>
        )}

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>

            <div className="login-input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                id="email"
                ref={userRef}
                autoComplete="username"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <div className="login-input-wrapper">
              <Lock size={18} />

              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                placeholder="Introduza a sua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Esconder password" : "Mostrar password"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* BUTTON */}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              "A entrar..."
            ) : (
              <>
                Entrar na conta
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* REGISTER */}

        <div className="login-register">
          <span>Ainda não tem uma conta?</span>

          <Link to="/registar">Criar conta</Link>
        </div>
      </div>

      <div className="login-copyright">
        © 2026 Nexus CRM. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Log;
