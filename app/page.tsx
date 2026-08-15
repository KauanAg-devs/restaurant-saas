import Link from 'next/link';

export default function Home() {
  return (
    <main className="landing">
      <section className="landing-card">
        <span className="eyebrow">MESAFLOW · RESTAURANT OS</span>
        <h1>Seu restaurante, sua marca, seu canal de vendas.</h1>
        <p>Cardápio white-label, pedidos e gestão em uma plataforma feita para virar produto — não só uma página de delivery.</p>
        <div className="landing-actions">
          <Link className="button button-dark" href="/loja/sabor-da-casa">Ver loja demo</Link>
          <Link className="button button-light" href="/admin?restaurant=sabor-da-casa">Abrir painel</Link>
        </div>
      </section>
    </main>
  );
}
