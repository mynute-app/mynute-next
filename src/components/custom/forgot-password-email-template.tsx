import * as React from "react";

interface ForgotPasswordEmailTemplateProps {
  employeeName: string;
  companyName: string;
  email: string;
  newPassword: string;
}

export const ForgotPasswordEmailTemplate: React.FC<
  Readonly<ForgotPasswordEmailTemplateProps>
> = ({ employeeName, companyName, newPassword }) => (
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
        background: "linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)",
        padding: "40px 20px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
        🔐 Nova Senha Temporária
      </h1>
      <p style={{ margin: "10px 0 0 0", fontSize: "16px", opacity: 0.9 }}>
        Sua senha foi redefinida com sucesso
      </p>
    </div>

    <div style={{ padding: "30px 20px", backgroundColor: "#ffffff" }}>
      <p style={{ fontSize: "18px", color: "#333", marginBottom: "20px" }}>
        Olá <strong>{employeeName}</strong>! 👋
      </p>

      <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
        Você solicitou uma nova senha para sua conta de funcionário na empresa{" "}
        <strong>{companyName}</strong>. Aqui está sua senha temporária:
      </p>

      {/* Nova Senha em destaque */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          border: "2px dashed #dee2e6",
          borderRadius: "8px",
          padding: "20px",
          margin: "25px 0",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            color: "#495057",
            fontSize: "16px",
          }}
        >
          Sua Nova Senha Temporária:
        </h3>
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #ced4da",
            borderRadius: "6px",
            padding: "15px",
            fontSize: "24px",
            fontWeight: "bold",
            fontFamily: "monospace",
            color: "#343a40",
            letterSpacing: "2px",
          }}
        >
          {newPassword}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          padding: "15px",
          margin: "20px 0",
        }}
      >
        <h4
          style={{
            margin: "0 0 10px 0",
            color: "#856404",
            fontSize: "16px",
          }}
        >
          ⚠️ Importante:
        </h4>
        <ul
          style={{
            margin: "0",
            paddingLeft: "20px",
            color: "#856404",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          <li>Esta é uma senha temporária gerada automaticamente</li>
          <li>Por motivos de segurança, altere esta senha após fazer login</li>
          <li>
            Acesse as configurações da sua conta para definir uma nova senha
          </li>
          <li>Não compartilhe esta senha com outras pessoas</li>
        </ul>
      </div>

      <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6" }}>
        Você pode usar esta senha para fazer login em sua conta. Após o login,
        recomendamos que você altere esta senha por uma de sua preferência nas
        configurações da conta.
      </p>

      {/* Botão de Login */}
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={`https://${
            process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000"
          }/auth/employee`}
          style={{
            display: "inline-block",
            backgroundColor: "#007bff",
            color: "white",
            padding: "12px 30px",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Fazer Login Agora
        </a>
      </div>
    </div>

    {/* Footer */}
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px",
        textAlign: "center",
        borderTop: "1px solid #dee2e6",
      }}
    >
      <p
        style={{
          margin: "0",
          fontSize: "14px",
          color: "#6c757d",
          lineHeight: "1.5",
        }}
      >
        Este e-mail foi enviado automaticamente pelo sistema Agenda Kaki.
        <br />
        Se você não solicitou esta alteração, entre em contato com o
        administrador da empresa.
      </p>
    </div>
  </div>
);
