#!/usr/bin/env bash
# scripts/deploy.sh — one-way sync local concept-hierarchy → prod
#
# Workflow:
#   1. Preflight: prod reachable
#   2. Sync design-system peer (../design-system/) to /var/www/design-system/
#   3. Sync concept-hierarchy source to /var/www/concept-hierarchy/
#   4. npm install on prod (Taobao mirror)
#   5. prisma generate
#   6. Build server (tsc)
#   7. Restart backend (kill old, start new)
#   8. Verify API responds
#
# Run from this repo's root:    bash scripts/deploy.sh
#
# Requirements:
#   - SSH config has 'prod' alias to 124.71.219.208 (see ~/.ssh/config)
#   - prod is reachable (password auth — will prompt)
#   - The companion design-system lives at ../design-system/ and gets synced
#     to /var/www/design-system/ on prod. This matches the file:../design-system
#     dep in package.json. If you rename or republish that dep, update step 2.

set -euo pipefail

readonly SSH_CONFIG="/c/Users/黄谦敏/.ssh/config"
readonly SSH_BASE="ssh -F ${SSH_CONFIG} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
readonly PROD="prod"
readonly APP_DIR="/var/www/concept-hierarchy"
readonly DS_DIR="/var/www/design-system"
readonly LOG_FILE="/var/log/concept-hierarchy-server.log"
readonly SERVICE_PATTERN="node dist/server/index.js"

# Wrap ssh with the HOME workaround for the Windows Chinese-username path issue.
ssh_prod() {
  HOME="C:\Users\黄谦敏\ClaudeCode" $SSH_BASE "$@"
}

main() {
  echo "=== 1. preflight: prod reachable ==="
  ssh_prod "$PROD" 'whoami && date'

  echo
  echo "=== 2. sync design-system (peer dep) ==="
  rsync -avz --delete-after \
    --exclude node_modules \
    --exclude dist \
    --exclude '.git' \
    -e "$SSH_BASE" \
    ../design-system/ "$PROD:$DS_DIR/"

  echo
  echo "=== 3. sync concept-hierarchy source ==="
  rsync -avz --delete-after \
    --exclude node_modules \
    --exclude dist \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude '.git' \
    --exclude '*.log' \
    --filter 'P node_modules/' \
    --filter 'P dist/' \
    --filter 'P prisma/*.db' \
    --filter 'P prisma/*.db-journal' \
    -e "$SSH_BASE" \
    ./ "$PROD:$APP_DIR/"

  echo
  echo "=== 4. npm install (Taobao mirror) ==="
  ssh_prod "$PROD" "cd $APP_DIR && npm install --registry=https://registry.npmmirror.com"

  echo
  echo "=== 5. prisma generate ==="
  ssh_prod "$PROD" "cd $APP_DIR && npm run db:generate"

  echo
  echo "=== 6. build:server ==="
  ssh_prod "$PROD" "cd $APP_DIR && npm run build:server"

  echo
  echo "=== 7. restart backend ==="
  ssh_prod "$PROD" "pkill -f '$SERVICE_PATTERN' 2>/dev/null || true; sleep 1; cd $APP_DIR && nohup node dist/server/index.js &> $LOG_FILE & disown; sleep 3; pgrep -af '$SERVICE_PATTERN' || true"

  echo
  echo "=== 8. verify API ==="
  ssh_prod "$PROD" "curl -s -o /dev/null -w 'HTTP %{http_code} (%{time_total}s)\n' http://127.0.0.1:3001/api/concepts"
}

main "$@"
