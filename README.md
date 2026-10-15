# Girassol — Site oficial

Site oficial da Girassol Loja de Flores (Porto): projeto web e presença digital da marca.

Site de uma página, em HTML, CSS e JavaScript simples (sem frameworks). A Netlify publica só a pasta `site/`.

## Estrutura

| Pasta / ficheiro | O que é |
|---|---|
| `site/` | **O site publicado.** |
| `site/dados/produtos.json` | Ramos, caixas e secção da época. **É aqui que se atualiza o conteúdo.** |
| `site/img/` | Fotos otimizadas (WebP) usadas no site. |
| `site/fonts/` | Tipos de letra (alojados no próprio site). |
| `ferramentas/otimizar_imagens.py` | Converte fotos novas para `site/img/`. |
| `netlify.toml` | Configuração da Netlify (publica `site/`). |

As fotos originais, o documento-base e as notas do projeto ficam no repositório de trabalho (`Pilares/1-sites/Girassol/`), não aqui.

## Como atualizar

**Acrescentar ou trocar um ramo**
1. Otimizar a foto nova (o caminho pode ser de qualquer pasta):
   `py ferramentas/otimizar_imagens.py "C:/caminho/para/ramonovo.jpg"`
   → cria `site/img/ramonovo.webp`
2. Em `site/dados/produtos.json`, acrescentar ao bloco `"ramos"`:
   `{ "nome": "Ramo Novo", "foto": "img/ramonovo.webp", "alt": "Descrição curta da foto", "visivel": true },`
3. Para esconder um ramo sem o apagar: `"visivel": false`.

**Mudar a secção da época (ex.: Natal → Páscoa)**
Em `"epoca"`: trocar `titulo`, `texto`, `mensagem_whatsapp` e as 4 `fotos`. Para esconder a secção: `"ativa": false`.

Atenção ao JSON: vírgulas entre itens, nenhuma vírgula depois do último, aspas duplas.

**Publicar a alteração:** fazer commit e push. Com a Netlify ligada a este repositório, o site atualiza-se sozinho.

## Ver no computador

Na pasta do repositório: `py -m http.server 8765 --directory site` e abrir http://localhost:8765/
(Abrir o `index.html` com duplo clique não carrega os produtos: o navegador bloqueia a leitura do JSON fora de um servidor.)

## Contactos usados no site

WhatsApp `351935481981`: em `site/js/main.js` (constante `WHATSAPP`) e nos links de reserva do `index.html`.

## Ferramenta de imagens

Precisa de Python e de: `py -m pip install --user opencv-python-headless`
