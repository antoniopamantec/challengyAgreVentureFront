import { useState, useEffect } from "react";
//REaproveitamento da estrutura.

import { Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
/* <h1>Resposta da API:</h1>
      {dados.map((lead) => (
        <div key={lead.id}>
          <h3>{lead.name}</h3>
          <p>{lead.email}</p>
        </div>
      ))}*/
export default App;
