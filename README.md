# GUTT ROYALE — THE PRINCIPADO EXPERIENCE

Site oficial estático do **GUTT ROYALE**, preparado para publicação no GitHub Pages.

## Estrutura

- `index.html` — conteúdo, SEO/social metadata e dados estruturados do evento
- `style.css` — identidade visual, responsividade e estados de acessibilidade
- `script.js` — contagem regressiva, reveal-on-scroll, header e navegação móvel
- `scripts/validate_site.py` — auditoria estática sem dependências externas
- `.github/workflows/site-quality.yml` — quality gate para pushes e pull requests
- `robots.txt` e `sitemap.xml` — descoberta por crawlers
- assets PNG na raiz — identidade visual e parceiros
- `.nojekyll` — publicação estática sem processamento Jekyll

## Quality gate

O workflow **Site quality** executa:

1. validação de HTML, IDs e âncoras;
2. checagem de referências locais e imagens com `alt`;
3. verificação de links `target="_blank"` com `noopener`;
4. presença de canonical, Open Graph e Twitter Cards;
5. sintaxe de `script.js`;
6. smoke test do site servido por HTTP.

A mesma validação pode ser executada localmente:

```bash
python3 scripts/validate_site.py
node --check script.js
```

## Publicação

Branch principal: `master`.

URL de publicação prevista:

`https://az1nn.github.io/guttroyale/`

No estado auditado em **22/09/2026**, o GitHub Pages está habilitado (`has_pages: true`). O build e o deploy nativos do Pages concluíram com sucesso após o merge `f95ad6f6`.

O canonical, Open Graph, sitemap e robots apontam para a URL publicada acima.

## Estado técnico

Correções consolidadas:

- removido o erro histórico `index.html.html`;
- assets locais sem dependência do repositório antigo;
- referências quebradas para `assets/` removidas;
- fallback para navegadores sem `IntersectionObserver`;
- suporte a `prefers-reduced-motion`;
- navegação por teclado e foco visível;
- navegação móvel restaurada;
- offset de âncoras para o header fixo;
- SEO/social metadata com URLs absolutas;
- JSON-LD do evento;
- quality gate automático.

### Pendente de infraestrutura

- considerar proteção/ruleset para `master`;
- otimizar `prince-gutt.png` (~2,9 MB) e `gutt-royale-logo-final.png` (~1,1 MB) para reduzir o payload inicial sem degradar a arte.

## Evento

**27 de novembro de 2026 — Rio de Janeiro**

THE PRINCIPADO EXPERIENCE
