// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login'); // redirige si no hay token
    }
  }, [router]);

  return (
    <div>
      <h1>Bienvenido al panel principal</h1>
      <p>Solo deberías ver esto si tienes un token válido.</p>
    </div>
  );
}

