# Github Action to deploy a service on Render

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Use this action to trigger a deploy of you webservice on Render

## Example Usage

```yml
environment:
   name: Staging
   url: ${{ steps.deployment.outputs.render_url }}
...
...
...
steps:
   - name: Deploy on Render
     uses: raghav-rama/deploy-on-render@3f3ddc66c0b6d987b0e4787d3ccf61876656eb4e
     with:
        render_api_key: ${{ secrets.RENDER_API_KEY }}
        service_id: ${{ secrets.RENDER_STAGING_SERVICE_ID }}
        timeout: 30
     id: deployment
```
## Known Limitations
- Cannot create a fresh deployment because Render limits creation of free services through API

