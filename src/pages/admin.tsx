import { useState } from 'react';

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orderReferenceId, setOrderReferenceId] = useState('');

  const handleLogin = () => {
    if (password === process.env.PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/ticket/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderReferenceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`${errorData.errors || response.statusText}`);
      }

      const body = await response.json();

      if (body.data.paid) {
        alert('Entrada paga');
      } else {
        alert('Entrada no paga');
      }
    } catch (error: any) {
      console.error('Error:', error.message);
      alert('Ocurrió un error al intentar hacer check-in');
    }
  };

  return (
    <div>
      {!authenticated ? (
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese contraseña"
          />
          <button onClick={handleLogin}>Ingresar</button>
        </div>
      ) : (
        <div>
          <h1>Check-In de Usuarios</h1>
          <input
            type="text"
            value={orderReferenceId}
            onChange={(e) => setOrderReferenceId(e.target.value)}
            placeholder="Order Reference ID"
          />
          <button onClick={handleCheckIn}>Hacer Check-In</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
