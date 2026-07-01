# Release checklist

- [x] Web lint
- [x] Web production build
- [x] Backend import/startup validation
- [x] Backend tests
- [x] Worker/migration syntax
- [x] Dependency audit
- [x] Security hardening review
- [x] Documentation baseline
- [ ] Flutter analyze/test and Android release build
- [ ] iOS archive/signing and universal-link validation
- [ ] Docker image/Compose execution
- [ ] Kubernetes dry-run and staging deployment
- [ ] Stripe webhook/checkout end-to-end test
- [ ] Apple/Google purchase validation
- [ ] Push and email delivery test
- [ ] Redis, queue, object storage and distributed Socket.IO validation
- [ ] Browser/mobile E2E suite
- [ ] WCAG automated and manual audit
- [ ] Authenticated load/soak test
- [ ] Backup restoration exercise
- [ ] External security assessment

Recommendation: **No-Go** until every unchecked critical release gate has objective staging evidence.
