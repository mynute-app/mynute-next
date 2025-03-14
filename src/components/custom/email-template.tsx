import * as React from "react";

interface EmailTemplateProps {
  fullName: string;
  email: string;
  phone: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  fullName,
  email,
  phone,
}) => (
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
    {/* Banner (Substitua com a URL da sua logo) */}
    <img
      src="https://images.vexels.com/content/4348/preview/futuristic-banner-51339b.png"
      alt="Banner da Marca"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
      }}
    />

    <div style={{ padding: "20px", backgroundColor: "#ffffff" }}>
      <h1 style={{ color: "#333", textAlign: "center" }}>
        📅 Confirmação de Agendamento
      </h1>

      <p style={{ fontSize: "16px", color: "#555", textAlign: "center" }}>
        Olá <strong>{fullName}</strong>, seu agendamento foi confirmado com
        sucesso! 🎉
      </p>

      <div
        style={{
          backgroundColor: "#f8f8f8",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "20px",
          boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p>
          <strong>📧 E-mail:</strong> {email}
        </p>
        <p>
          <strong>📞 Telefone:</strong> {phone}
        </p>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "14px",
          color: "#777",
        }}
      >
        Caso tenha dúvidas, entre em contato conosco.
      </p>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <a
          href="https://seusite.com.br"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: "#007BFF",
            color: "#fff",
            padding: "12px 24px",
            textDecoration: "none",
            borderRadius: "5px",
            display: "inline-block",
            fontWeight: "bold",
          }}
        >
          Acessar Meu Agendamento
        </a>
      </div>

      <p
        style={{
          textAlign: "center",
          marginTop: "20px",
          fontSize: "12px",
          color: "#aaa",
        }}
      >
        © 2024 Sua Empresa - Todos os direitos reservados.
      </p>
    </div>
  </div>
);
