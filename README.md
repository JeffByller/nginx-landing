# Nginx Landing & Reverse Proxy

Servidor web Nginx atuando como gateway proxy reverso e renovador automatizado de certificados SSL (Let's Encrypt / Certbot) para todos os serviços hospedados no ambiente.

## 🚀 Funcionalidades

- **Proxy Reverso**: Roteamento seguro para os containers `meuprovedor`, `jprovider`, `intelbrasmonitore` e `unifi`.
- **Certificados SSL Automáticos**: Integração com Certbot para emissão e renovação automática HTTPS.
- **Página de Landing**: Apresentação principal do provedor.

## 🛠️ Tecnologias Utilizadas

- **Nginx**: Servidor web e Proxy Reverso
- **Certbot**: Automação SSL Let's Encrypt
- **Infraestrutura**: Docker & Docker Compose
