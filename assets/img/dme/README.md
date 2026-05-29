# Documentation screenshots

All UI and cluster screenshots for README, PDF articles, and operator docs live under this folder.

| Folder | Contents | Used by |
|--------|----------|---------|
| [`platform/`](platform/) | Login, extraction, validation, admin, scheduler, infra (legacy README gallery) | [Root README.md](../../../README.md) |
| [`api-access/`](api-access/) | DME API Platform — documentation and keys (current stage UI) | [Api-access_Server_cluster_manage_page.md](../Api-access_Server_cluster_manage_page.md) |
| [`_archive/`](_archive/) | Superseded screenshots (old API/Argo/portainer) | Reference only |
| [`argocd/`](argocd/) | Argo CD applications — core-app, data-services, network, PKI, NATS | Root README (GitOps), API/cluster article |
| [`server-cluster/`](server-cluster/) | Server management (`/server-potential`) — Fleet, Controls, Argo tabs | Root README, API/cluster article §7 |

**`server-cluster/` files:**

| File | UI content |
|------|------------|
| `server-fleet.png` | Fleet tab — per-node cards, worker CPU presets, live pod counters |
| `server-control1.png` | Controls tab — corp/muni allocation and platform toggles |
| `server-control2.png` | Controls tab — backend follower candidate placement |
| `server-control3.png` | Controls tab — frontend multi-pod placement sample |
| `server-portargo.png` | Argo tab — embedded `dme-core-app` sync/health status |
| `architecture-flow.mmd` | Mermaid source (same as GitHub renders in the article) | Edit diagram here |
| `architecture-flow.png` | Rasterized by `mmdc` for PDF export | Auto-generated; do not hand-edit |

Do not use `architecture-flow.svg` (removed; use `.mmd` + `mmdc` only).

**PDF export:** From `fullstack/docs/`, use `--resource-path=.` so paths like `images/api-access/DME_api_docs_page.png` resolve.

**Moved from (deprecated):**

- `img_for_demo_readme/` → `images/platform/`
- `fullstack/docs/api_server_page/` → `images/api-access/` + `images/argocd/`
- `server_cluster_manage_page/server_page*.png` → `images/server-cluster/server-*.png`
