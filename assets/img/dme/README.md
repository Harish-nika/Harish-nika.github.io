# DME portfolio images

Screenshots for [dme-project.html](../../../dme-project.html) case study.

| Folder | Contents |
|--------|----------|
| `platform/` | UI: login, extraction, validation, admin, scheduler |
| `api-access/` | API docs and keys pages |
| `server-cluster/` | `/server-potential` Fleet, Controls, Argo |
| `argocd/` | Argo CD application views |
| `git_build_promote/` | GitLab K3 pipeline (build → promote → deploy) |
| `architecture-flow.mmd` | Full stack — runtime + GitOps |
| `gitops-flow.mmd` | CI → charts → Argo |
| `runtime-flow.mmd` | Queue mode runtime |
| `request-path-flow.mmd` | Browser → backend → workers |
| `extraction-dispatch-flow.mmd` | Redis queue vs HTTP fallback |
| `worker-pipeline-flow.mmd` | Inside worker pod |
| `cluster-ops-flow.mmd` | Server management → K8s |

**Update pipeline screenshot:** copy from repo  
`fullstack/docs/images/git_build_promote/git_pipeline.png`  
→ `git_build_promote/git_pipeline.png`

**Diagrams in case study:** pre-rendered PNGs (avoids Mermaid errors on hidden tabs). Regenerate:

```bash
# from this directory; mmdc from data-mining-engine fullstack/docs (npm install @mermaid-js/mermaid-cli there once)
MMDC=/path/to/data-mining-engine/fullstack/docs/node_modules/.bin/mmdc
for f in architecture-flow gitops-flow runtime-flow request-path-flow extraction-dispatch-flow worker-pipeline-flow cluster-ops-flow; do
  "$MMDC" -i "$f.mmd" -o "$f.png" -b white
done
```
