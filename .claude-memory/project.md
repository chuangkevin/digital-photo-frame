# Photo frame maintenance

- 2026-10-06: frontend 1.0.1 adds exact `/health` proxy through Docker DNS to backend:3001; API and Socket.IO routes retain their existing behavior.
- PWA registration uses a network-only, registration-only `/sw.js`; generic frame icons supply the existing manifest paths.
- Deploy workflow targets `rpi-docker` only, tags both previous service images for manual rollback, and runs `docker compose pull` then `docker compose up -d`. It preserves both-service deployment without stopping the stack or pruning shared images.
- Parent session owns CI/CD execution and post-deployment checks. Local verification is recorded in central OpenSpec `photo-frame-health-pwa/tasks.md`.
