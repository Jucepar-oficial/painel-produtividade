# Manual de implantação e atualização mensal

## 1. Objetivo

Este pacote mantém o painel e seus dados sob controle institucional da Jucepar. O painel é composto por arquivos estáticos HTML, CSS, JavaScript, imagens e JSON. Não depende de conta do ChatGPT, Power BI, banco de dados ou serviço externo.

## 2. Implantação inicial

1. A Celepar deve criar um diretório público para o painel.
2. Copiar todo o conteúdo deste pacote, preservando as pastas.
3. Confirmar que `index.html`, `dados/manifest.json` e os arquivos JSON respondem pelo mesmo domínio.
4. A página Drupal pode apontar diretamente ao painel ou incorporá-lo por `iframe`.
5. Manter `conversor.html` em área interna ou no computador responsável pela atualização; ele não precisa ser público.

Exemplo de incorporação:

```html
<iframe src="CAMINHO-INSTITUCIONAL/index.html" title="Painel de Produtividade dos Vogais" width="100%" height="3000" frameborder="0" style="width:100%;border:0;display:block"></iframe>
```

## 3. Atualização mensal

1. Exportar do sistema somente os registros da competência encerrada.
2. Abrir `conversor.html` em um navegador atualizado.
3. Informar ano e mês, selecionar a planilha e clicar em **Validar planilha**.
4. Conferir total de registros, vogais e combinações agregadas.
5. Baixar o JSON e publicá-lo na pasta `dados`.
6. Abrir `dados/manifest.json`, inserir uma vírgula após o item anterior e acrescentar o novo nome de arquivo.
7. Atualizar `ultimaAtualizacao` no formato `AAAA-MM-DD`.
8. Se necessário, acrescentar os dias úteis em `dados/calendario.json`.
9. Abrir o painel, selecionar o novo mês e conferir total, média e ranking.

Exemplo após publicar fevereiro de 2026:

```json
{
  "ultimaAtualizacao": "2026-03-03",
  "arquivos": [
    "produtividade-2025.json",
    "produtividade-2026-01.json",
    "produtividade-2026-02.json"
  ]
}
```

## 4. Controles de segurança e qualidade

- O JSON não contém protocolo, data/hora individual ou qualquer linha detalhada.
- Nunca publique a planilha bruta dentro da pasta pública do painel.
- Preserve uma cópia do pacote anterior antes de cada atualização.
- Não altere os nomes das colunas `RELATOR`, `Tipo de Análise`, `Data`, `Protocolo` e `Situação`.
- Não misture dois meses no arquivo mensal. O conversor ignora outros meses e informa as competências encontradas.
- A planilha mensal precisa conter somente a aba `DADOS`; os vínculos dos vogais já estão incorporados ao conversor.
- Se um novo vogal aparecer ou houver alteração de entidade, atualize o cadastro institucional no arquivo `conversor.js` antes de gerar o JSON.

## 5. Conferência mínima

- Total do mês no painel = total válido da planilha.
- Número de dias úteis correto.
- Fotos e entidades corretas.
- Ranking geral e consulta individual coerentes.
- Filtros, exportação CSV e visualização em celular funcionando.

## 6. Responsabilidade e continuidade

Recomenda-se designar ao menos dois servidores para a atualização, guardar o pacote em diretório institucional com controle de acesso e registrar cada publicação com data, competência e responsável.
