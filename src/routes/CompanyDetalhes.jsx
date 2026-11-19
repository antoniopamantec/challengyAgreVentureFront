import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const CompanyDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleContact = () => {
    console.log("mensagem enviado!");
    return navigate("/");
  };

  return (
    <div>
      <h2>Exibindo informações company com mais detalhes:{id}</h2>
      <button onClick={handleContact}>Enviar mensagem</button>
    </div>
  );
};

export default CompanyDetalhes;
