import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Palette,
  ShoppingBag,
  Store,
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Sua loja, sua marca",
    text: "Um cardápio digital com identidade própria, pronto para receber pedidos sem intermediários.",
  },
  {
    icon: ShoppingBag,
    title: "Operação em um só lugar",
    text: "Produtos, disponibilidade, pedidos e status organizados em um painel simples para a rotina.",
  },
  {
    icon: Palette,
    title: "Personalização de verdade",
    text: "Cores, logo, imagens e estilo visual para cada restaurante ter uma presença própria.",
  },
];

const steps = [
  [
    "01",
    "Crie a loja",
    "Informe o essencial da operação e escolha os meios de pagamento.",
  ],
  [
    "02",
    "Monte o cardápio",
    "Cadastre produtos, preços, fotos, categorias e adicionais.",
  ],
  [
    "03",
    "Comece a vender",
    "Compartilhe o link e acompanhe os pedidos pelo painel.",
  ],
];

export default function Home() {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav">
        <Link className="marketing-brand" href="/">
          <span>M</span>
          <b>MesaFlow</b>
        </Link>
        <div>
          <Link href="/admin">Entrar</Link>
          <Link className="button button-dark" href="/onboarding">
            Criar minha loja
          </Link>
        </div>
      </nav>

      <section className="landing">
        <div className="landing-card">
          <span className="eyebrow">SEU CANAL DIRETO DE VENDAS</span>
          <h1>
            Seu restaurante.
            <br />
            Do seu jeito.
          </h1>
          <p>
            Cardápio, pedidos e operação em uma experiência própria — simples
            para sua equipe e bonita para seus clientes.
          </p>
          <div className="landing-actions">
            <Link className="button button-dark" href="/onboarding">
              Criar minha loja <ArrowRight size={16} />
            </Link>
            <Link className="button button-light" href="/loja/sabor-da-casa">
              Conhecer a loja demo
            </Link>
          </div>
          <div className="landing-proof">
            <span>
              <CheckCircle2 size={16} /> Configuração guiada
            </span>
            <span>
              <CheckCircle2 size={16} /> Loja personalizada
            </span>
            <span>
              <CheckCircle2 size={16} /> Pedidos direto no painel
            </span>
          </div>
        </div>
      </section>

      <section className="marketing-section marketing-features">
        <div className="marketing-heading">
          <span className="eyebrow">TUDO CONECTADO</span>
          <h2>
            Menos improviso.
            <br />
            Mais controle.
          </h2>
          <p>
            Uma base profissional para transformar o canal digital do
            restaurante em parte real da operação.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <span>
                <Icon size={21} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section marketing-flow">
        <div className="marketing-heading">
          <span className="eyebrow">DO ZERO AO PRIMEIRO PEDIDO</span>
          <h2>Comece com clareza.</h2>
        </div>
        <div className="flow-grid">
          {steps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-cta">
        <div>
          <span className="eyebrow">PRONTO PARA COMEÇAR?</span>
          <h2>Coloque sua loja no ar.</h2>
          <p>
            Crie a estrutura inicial agora e evolua a identidade e o cardápio no
            seu ritmo.
          </p>
        </div>
        <Link className="button" href="/onboarding">
          Criar minha loja <ArrowRight size={17} />
        </Link>
      </section>
      <footer className="marketing-footer">
        <Link className="marketing-brand" href="/">
          <span>M</span>
          <b>MesaFlow</b>
        </Link>
        <p>Operação digital para restaurantes independentes.</p>
        <Link href="/admin">Acessar painel</Link>
      </footer>
    </main>
  );
}
