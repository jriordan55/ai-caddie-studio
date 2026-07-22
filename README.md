# AI Caddie Studio

Public DIY version of **AI Caddie**, plus **copy-paste prompts** so anyone can paste into Claude, Cursor, or ChatGPT and get their own caddie or yardage book.

**Studio:** https://jriordan55.github.io/ai-caddie-studio/  
**Prompts:** https://jriordan55.github.io/ai-caddie-studio/prompts.html  
**Prompt source:** [PROMPTS.md](./PROMPTS.md)

## Personal vs Studio

| | Personal AI Caddie | Studio |
|---|---|---|
| URL | https://jriordan55.github.io/ai-caddie/ | https://jriordan55.github.io/ai-caddie-studio/ |
| Data | Fixed bag + mapped courses | Each user’s own bag + courses |
| Audience | Private build | Anyone |

## Prompt pack

- **A** Instant AI Caddie web app from bag + courses
- **B** Instant yardage book PDF for one course
- **C** Both together
- **D** Produce CSV + greens JSON to upload into this Studio

## Local files

```
studio/
  index.html          Landing
  prompts.html        Copy buttons for AI prompts
  PROMPTS.md          Same prompts in markdown
  setup.html          Bag + courses wizard (avg carry required; CSV optional)
  app.html            AI Caddie app (profile-driven)
  js/profile.js       localStorage profile helpers
  community-greens.js Shared GPS course library
```
