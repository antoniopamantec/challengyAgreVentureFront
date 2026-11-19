import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navegate = useNavigate();
  useEffect(() => {
    const loadingStoreData = async () => {
      const storageUser = localStorage.getItem("user");
      const storageToken = localStorage.getItem("token");

      if (storageUser && storageToken) {
        setUser(storageUser);
      }
    };
    loadingStoreData();
  }, []);

  const login = async ({ email, password }) => {
    const response = await axios.post(
      "http://localhost:3000/autenticacao/login",
      { email, password },
    );

    if (response.data.error) {
      alert("Falha na autenticação!!");
    } else {
      setUser(response.data.nome);

      /* axios.defaults.headers.common["Authorization"] =
        `Bearer${response.data.accesssToken}`;*/
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", response.data.nome);
      localStorage.setItem("id", response.data.id);
    }
  };
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(token);
      // Verifica se existe token
      if (!token) {
        throw new Error("Token não encontrado.");
      }

      // Envia pedido de logout
      const response = await axios.post(
        "http://localhost:3000/autenticacao/logout",
        {
          token,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      // Verifica resposta da API
      if (response.data?.error) {
        alert(response.data.message || "Falha ao terminar sessão.");
        return;
      }

      // Remove autorização global
      delete axios.defaults.headers.common["Authorization"];

      // Limpa estado do utilizador
      setUser(null);

      // Remove dados locais
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("id");

      // Feedback
      alert("Sessão terminada com sucesso.");

      // Redireciona
      navegate("/");
    } catch (error) {
      console.error("Erro no logout:", error);

      alert(error.response?.data?.message || "Erro ao terminar sessão.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

/*export function useAuth() {
  return useContext(AuthContext);
}*/
