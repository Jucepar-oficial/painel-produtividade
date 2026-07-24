# Painel de Produtividade dos Vogais — Jucepar

Pacote institucional independente de conta pessoal ou serviço do ChatGPT.

## Conteúdo

- `index.html`: painel público.
- `conversor.html`: conversor local de Excel para JSON agregado.
- `dados/manifest.json`: lista dos arquivos carregados pelo painel.
- `dados/calendario.json`: dias úteis oficiais por competência.
- `dados/produtividade-2025.json`: histórico consolidado de 2025.
- `dados/produtividade-2026-01.json`: janeiro de 2026.
- `MANUAL.md`: implantação e atualização mensal.

## Teste local

Não abra o `index.html` com duplo clique, pois o navegador pode bloquear a leitura dos JSON. Na pasta do pacote, execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

Em produção, copie todo o conteúdo para um diretório web da Jucepar. Nenhum servidor de aplicação ou banco de dados é necessário.
