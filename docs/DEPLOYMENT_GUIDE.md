# Deployment guide

Build immutable images from signed release tags. Supply secrets through a managed secret store, deploy migrations once, then API, workers and web. Configure TLS at ingress, sticky-free distributed Socket.IO, Redis, MongoDB backups, object storage/CDN and provider callbacks. Use `deploy/k8s` directly or translate `deploy/helm/values.yaml` into environment-specific templates.
