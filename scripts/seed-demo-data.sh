#!/usr/bin/env bash
# Seeds the same demo scenario used during development: an admin account, a client
# account, and a batch of real orders clustered around a few Colombo suburbs so the
# Route Optimization map shows multi-stop routes out of the box.
#
# Run this ONCE after `docker compose up --build -d` (from the repo root, or anywhere —
# it only talks to the gateway on localhost:8080 and to the local `postgres` container).
# Safe to re-run: registration conflicts and duplicate-driver/vehicle errors are ignored.
#
# Requires: the docker compose stack running locally, curl, and Docker CLI access to the
# `postgres` container (only used once, to promote the admin account's role).

set -uo pipefail

API_BASE="${API_BASE:-http://localhost:8080}"
ADMIN_EMAIL="admin@gmail.com"
ADMIN_USERNAME="admin@gmail.com"
ADMIN_PASSWORD="admin123"
CLIENT_EMAIL="user1@gmail.com"
CLIENT_USERNAME="user1@gmail.com"
CLIENT_PASSWORD="test123"

echo "Waiting for the gateway to become ready at ${API_BASE}..."
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/api/auth/login" -X POST -H "Content-Type: application/json" -d '{}')
  if [ "$code" != "000" ]; then
    echo "Gateway is up."
    break
  fi
  sleep 2
done

register() {
  local username="$1" email="$2" password="$3"
  curl -s -X POST "${API_BASE}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${username}\",\"password\":\"${password}\",\"email\":\"${email}\"}" > /dev/null
}

echo "Registering admin account (${ADMIN_EMAIL})..."
register "$ADMIN_USERNAME" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

echo "Promoting admin account to ADMIN role..."
docker exec postgres psql -U postgres -d swiftlogistics -c \
  "UPDATE users SET role='ADMIN' WHERE email='${ADMIN_EMAIL}';" > /dev/null 2>&1 \
  || echo "  (couldn't reach the postgres container directly - promote it manually if needed: UPDATE users SET role='ADMIN' WHERE email='${ADMIN_EMAIL}';)"

echo "Registering client account (${CLIENT_EMAIL})..."
register "$CLIENT_USERNAME" "$CLIENT_EMAIL" "$CLIENT_PASSWORD"

echo "Logging in as ${CLIENT_USERNAME}..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${CLIENT_USERNAME}\",\"password\":\"${CLIENT_PASSWORD}\"}")
TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "Could not log in as ${CLIENT_USERNAME}. Response was:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

create_order() {
  curl -s -X POST "${API_BASE}/api/orders" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d "$1" > /dev/null
}

echo "Creating demo orders (this triggers the real CMS/ROS/WMS pipeline)..."

# South cluster: Nugegoda / Maharagama / Kottawa
create_order '{"description":"Grocery delivery","senderAddress":"142 Galle Road, Colombo 03","recipientAddress":"25 High Level Road, Nugegoda","weight":2.0,"receiverName":"Ishara Gunasekara","receiverPhone":"0771111001","packageType":"Parcel","priority":"Standard"}'
create_order '{"description":"Electronics parcel","senderAddress":"142 Galle Road, Colombo 03","recipientAddress":"14 Highway, Maharagama","weight":1.4,"receiverName":"Ruwan Fernando","receiverPhone":"0771111002","packageType":"Parcel","priority":"Express"}'
create_order '{"description":"Clothing order","senderAddress":"142 Galle Road, Colombo 03","recipientAddress":"3 Kottawa Road, Kottawa","weight":0.8,"receiverName":"Sanduni Perera","receiverPhone":"0771111003","packageType":"Parcel","priority":"Standard"}'

# East cluster: Kotte / Battaramulla
create_order '{"description":"Documents","senderAddress":"10 Union Place, Colombo 02","recipientAddress":"7 Pagoda Road, Kotte","weight":0.4,"receiverName":"Kamala Silva","receiverPhone":"0771111004","packageType":"Documents","priority":"Express"}'
create_order '{"description":"Office supplies","senderAddress":"10 Union Place, Colombo 02","recipientAddress":"19 Main Street, Battaramulla","weight":3.5,"receiverName":"Nadeesha Wickrama","receiverPhone":"0771111005","packageType":"Parcel","priority":"Standard"}'

# North cluster: Wattala / Kelaniya
create_order '{"description":"Furniture parts","senderAddress":"88 Marine Drive, Colombo 06","recipientAddress":"5 Negombo Road, Wattala","weight":6.0,"receiverName":"Dinesh Bandara","receiverPhone":"0771111006","packageType":"Parcel","priority":"Standard"}'
create_order '{"description":"Perishables","senderAddress":"88 Marine Drive, Colombo 06","recipientAddress":"11 Temple Road, Kelaniya","weight":1.2,"receiverName":"Farhana Rizwan","receiverPhone":"0771111007","packageType":"Parcel","priority":"Express"}'

echo ""
echo "Done. Log in with:"
echo "  Admin  -> email: ${ADMIN_EMAIL}    password: ${ADMIN_PASSWORD}"
echo "  Client -> username: ${CLIENT_USERNAME}  password: ${CLIENT_PASSWORD}"
echo ""
echo "Check the admin Route Optimization tab - the 7 orders above should already show up"
echo "as 2-3 clustered multi-stop routes (drivers/vehicles are seeded automatically by"
echo "ROS_Adapter on every startup, no extra step needed for those)."
