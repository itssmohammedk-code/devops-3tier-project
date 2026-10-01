# GitOps repository contents

This directory contains the Argo CD bootstrap configuration for this
application repository. Keeping deployment configuration here is a simple
single-repository GitOps setup. A separate GitOps repository can be introduced
later if the project needs that separation.

## Layout

- `bootstrap/application.yaml` registers the application with Argo CD; apply it with `kubectl apply -k gitops/bootstrap`.
- `../helm/devops-3tier/values-prod.yaml` contains production Helm overrides.
- `monitoring/` contains the monitoring and metrics-server Argo CD applications.

The Argo CD Application reads both the chart and its production values from
this repository. The chart remains in one canonical location.

## Bootstrap requirements

1. Install Argo CD in the EKS cluster and register the application repository
   if it is private.
2. Apply `bootstrap/application.yaml` to the `argocd` namespace.

Jenkins publishes both a full Git commit SHA image tag and the mutable `latest`
compatibility tag. Production values retain `latest` until you promote a
successful SHA by updating both image tags and pull policies in
`helm/devops-3tier/values-prod.yaml`. Database credentials are read from the
pre-created `devops-3tier-db` Secret in namespace `app`; no password values are
committed here.

Automated sync and self-healing are enabled. Automated pruning is disabled
because the current Helm chart manages a MySQL PVC and deleting it can destroy
database data. Pruning can be reconsidered after persistent data lifecycle and
retention behavior are explicitly protected.

No AWS resources are created by these files.
