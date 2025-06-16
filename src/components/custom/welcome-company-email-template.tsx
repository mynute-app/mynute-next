import * as React from "react";

interface WelcomeCompanyEmailTemplateProps {
  ownerName: string;
  companyName: string;
  email: string;
  subdomain: string;
}

export const WelcomeCompanyEmailTemplate: React.FC<
  Readonly<WelcomeCompanyEmailTemplateProps>
> = ({ ownerName, companyName, email, subdomain }) => (
  <div
    style={{
      maxWidth: "600px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
      border: "1px solid #ddd",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    {/* Banner */}
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
        🎉 Bem-vindo ao Agenda Kaki!
      </h1>
      <p style={{ margin: "10px 0 0 0", fontSize: "16px", opacity: 0.9 }}>
        Sua empresa foi cadastrada com sucesso
      </p>
    </div>

    <div style={{ padding: "30px 20px", backgroundColor: "#ffffff" }}>
      <p style={{ fontSize: "18px", color: "#333", marginBottom: "20px" }}>
        Olá <strong>{ownerName}</strong>! 👋
      </p>

      <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
        Parabéns! Sua empresa <strong>{companyName}</strong> foi cadastrada com
        sucesso em nossa plataforma. Agora você pode começar a gerenciar seus
        agendamentos de forma eficiente e profissional.
      </p>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          margin: "25px 0",
          border: "1px solid #e9ecef",
        }}
      >
        <h3 style={{ color: "#333", marginTop: "0", marginBottom: "15px" }}>
          📋 Detalhes da sua conta:
        </h3>
        <p style={{ margin: "8px 0" }}>
          <strong>👤 Nome:</strong> {ownerName}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>🏢 Empresa:</strong> {companyName}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>📧 E-mail:</strong> {email}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>🌐 Subdomínio:</strong> {subdomain}.agendakaki.com
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#e3f2fd",
          padding: "20px",
          borderRadius: "8px",
          margin: "25px 0",
          borderLeft: "4px solid #2196f3",
        }}
      >
        <h3 style={{ color: "#1976d2", marginTop: "0", marginBottom: "15px" }}>
          🚀 Próximos passos:
        </h3>
        <ul style={{ color: "#555", paddingLeft: "20px", lineHeight: "1.6" }}>
          <li>Acesse sua conta usando o link abaixo</li>
          <li>Configure os serviços da sua empresa</li>
          <li>Adicione seus funcionários à equipe</li>
          <li>Personalize o visual da sua página de agendamentos</li>
        </ul>
      </div>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={`https://${subdomain}.agendakaki.com/auth/employee`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            padding: "15px 30px",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          🔗 Acessar Minha Conta
        </a>
      </div>

      <div
        style={{
          backgroundColor: "#fff3cd",
          padding: "15px",
          borderRadius: "8px",
          margin: "25px 0",
          border: "1px solid #ffeaa7",
        }}
      >
        <p style={{ margin: "0", fontSize: "14px", color: "#856404" }}>
          💡 <strong>Dica:</strong> Guarde este e-mail para referência futura.
          Caso tenha dúvidas, nossa equipe de suporte está sempre disponível
          para ajudar!
        </p>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "30px",
          fontSize: "14px",
          color: "#777",
        }}
      >
        Caso tenha dúvidas, entre em contato conosco através do e-mail:{" "}
        <a href="mailto:suporte@agendakaki.com" style={{ color: "#2196f3" }}>
          suporte@agendakaki.com
        </a>
      </p>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #eee",
          margin: "30px 0",
        }}
      />

      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#aaa",
          margin: "0",
        }}
      >
        © 2024 Agenda Kaki - Todos os direitos reservados.
        <br />
        Este e-mail foi enviado automaticamente, por favor não responda.
      </p>
    </div>
  </div>
);
