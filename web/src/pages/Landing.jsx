import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              Almoxarifado Pro
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
          }}>
            Gerencie seu Almoxarifado com Inteligência
          </h1>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: 0.9,
            lineHeight: '1.6',
          }}>
            Sistema completo de gestão de estoque, controle de itens, obras e movimentações.
            Multi-tenant, seguro e fácil de usar.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                color: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              Comece Agora - Grátis
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{
                padding: '1rem 2rem',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              Ver Recursos
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '4rem 2rem',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#1f2937',
          }}>
            Recursos Completos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            <FeatureCard
              icon="📦"
              title="Gestão de Itens"
              description="Controle completo de itens com QR Code, código de barras, categorias e locais de armazenamento."
            />
            <FeatureCard
              icon="📊"
              title="Dashboard Analítico"
              description="Visualize gráficos e métricas em tempo real sobre seu estoque e movimentações."
            />
            <FeatureCard
              icon="🚨"
              title="Alertas de Estoque"
              description="Receba notificações quando os itens atingirem o estoque mínimo configurado."
            />
            <FeatureCard
              icon="📍"
              title="Locais de Armazenamento"
              description="Organize seu almoxarifado com múltiplos locais: depósitos, estantes, prateleiras e mais."
            />
            <FeatureCard
              icon="🏗️"
              title="Gestão de Obras"
              description="Controle quais itens estão alocados em cada obra ou projeto."
            />
            <FeatureCard
              icon="🔄"
              title="Transferências"
              description="Registre transferências de itens entre locais, obras e funcionários."
            />
            <FeatureCard
              icon="📜"
              title="Histórico Completo"
              description="Rastreie todas as movimentações: entradas, saídas, transferências e ajustes."
            />
            <FeatureCard
              icon="👥"
              title="Multi-usuário"
              description="Gerencie múltiplos usuários com diferentes níveis de acesso por organização."
            />
            <FeatureCard
              icon="🔐"
              title="Seguro e Multi-tenant"
              description="Seus dados isolados e protegidos. Cada organização tem seu próprio espaço."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: 'white',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#1f2937',
          }}>
            Planos Flexíveis
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '1.125rem',
            color: '#6b7280',
            marginBottom: '3rem',
          }}>
            Escolha o plano ideal para o tamanho da sua operação
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            <PricingCard
              name="Básico"
              price="Grátis"
              features={[
                'Até 100 itens',
                'Até 3 usuários',
                'Dashboard básico',
                'QR Code ilimitado',
                'Suporte por email',
              ]}
              cta="Começar Grátis"
              onClick={() => navigate('/login')}
            />
            <PricingCard
              name="Profissional"
              price="R$ 99/mês"
              features={[
                'Até 1.000 itens',
                'Até 10 usuários',
                'Dashboard avançado',
                'Múltiplas obras',
                'Suporte prioritário',
              ]}
              highlighted
              cta="Contratar"
              onClick={() => navigate('/login')}
            />
            <PricingCard
              name="Enterprise"
              price="R$ 299/mês"
              features={[
                'Itens ilimitados',
                'Usuários ilimitados',
                'API completa',
                'Personalização',
                'Suporte 24/7',
              ]}
              cta="Falar com Vendas"
              onClick={() => navigate('/login')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
          }}>
            Pronto para começar?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            marginBottom: '2rem',
            opacity: 0.9,
          }}>
            Crie sua conta gratuita agora e comece a gerenciar seu almoxarifado com inteligência
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '1rem 2.5rem',
              backgroundColor: 'white',
              color: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            Comece Grátis Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        backgroundColor: '#1f2937',
        color: '#9ca3af',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'white',
              marginLeft: '0.5rem',
            }}>
              Almoxarifado Pro
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
            Sistema profissional de gestão de almoxarifado
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            © 2025 Almoxarifado Pro. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.75rem',
        color: '#1f2937',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        lineHeight: '1.5',
      }}>
        {description}
      </p>
    </div>
  );
}

function PricingCard({ name, price, features, cta, onClick, highlighted }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: highlighted ? '0 10px 25px rgba(37,99,235,0.2)' : '0 4px 6px rgba(0,0,0,0.05)',
      border: highlighted ? '2px solid #2563eb' : '1px solid #e5e7eb',
      position: 'relative',
      transform: highlighted ? 'scale(1.05)' : 'scale(1)',
    }}>
      {highlighted && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.25rem 1rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
        }}>
          MAIS POPULAR
        </div>
      )}
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: '#1f2937',
        textAlign: 'center',
      }}>
        {name}
      </h3>
      <div style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        {price}
      </div>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        marginBottom: '2rem',
      }}>
        {features.map((feature, index) => (
          <li key={index} style={{
            padding: '0.75rem 0',
            borderBottom: '1px solid #f3f4f6',
            fontSize: '0.875rem',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ color: '#10b981' }}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '0.75rem 1.5rem',
          backgroundColor: highlighted ? '#2563eb' : '#f3f4f6',
          color: highlighted ? 'white' : '#1f2937',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        {cta}
      </button>
    </div>
  );
}
