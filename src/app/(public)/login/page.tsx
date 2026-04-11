'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth events (e.g. successful login)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          router.push("/");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 pb-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 z-10 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-raised border border-border shadow-inner mb-4">
            <span className="text-2xl font-black text-white">B</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Bubina
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-text-dim mt-2">
            Ponto de Venda em Nuvem
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#22c55e', 
                  brandAccent: '#16a34a',
                  inputBackground: '#1A1D24', 
                  inputText: 'white',
                  inputBorder: '#232731', 
                  messageText: '#A1A1AA', 
                },
                space: {
                  buttonPadding: '12px 20px',
                  inputPadding: '14px 16px',
                },
                radii: {
                  borderRadiusButton: '8px',
                  buttonBorderRadius: '8px',
                  inputBorderRadius: '8px',
                },
              },
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
              label: 'auth-label text-[11px] font-black uppercase tracking-wider text-text-muted',
            }
          }}
          providers={[]} 
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Seu e-mail',
                password_input_placeholder: 'Sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'Seu e-mail',
                password_input_placeholder: 'Crie uma senha',
                button_label: 'Criar conta',
                loading_button_label: 'Criando conta...',
                social_provider_text: 'Cadastrar com {{provider}}',
                link_text: 'Não tem uma conta? Cadastre-se',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
