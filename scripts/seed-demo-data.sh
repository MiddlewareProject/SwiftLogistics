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
DEMO_DRIVER_PASSWORD="driver123"

request_json() {
  local method="$1" url="$2" payload="$3" auth_header="${4:-}"
  if [ -n "$auth_header" ]; then
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "$auth_header" \
      -d "$payload"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$payload"
  fi
}

response_body() {
  echo "$1" | sed '$d'
}

response_code() {
  echo "$1" | tail -n 1
}

json_field() {
  local json="$1" field="$2"
  echo "$json" | sed -n "s/.*\"${field}\":\"\\([^\"]*\\)\".*/\\1/p"
}

echo "Waiting for the gateway and Order Service auth to become ready at ${API_BASE}..."
ready=false
for i in $(seq 1 30); do
  response=$(request_json "POST" "${API_BASE}/api/auth/login" '{}')
  code=$(response_code "$response")
  if [ "$code" = "400" ] || [ "$code" = "401" ]; then
    echo "Gateway and auth endpoint are ready."
    ready=true
    break
  fi
  sleep 2
done

if [ "$ready" != "true" ]; then
  echo "Gateway/auth endpoint did not become ready in time."
  exit 1
fi

register() {
  local username="$1" email="$2" password="$3"
  local response code body
  response=$(request_json "POST" "${API_BASE}/api/auth/register" "{\"username\":\"${username}\",\"password\":\"${password}\",\"email\":\"${email}\"}")
  code=$(response_code "$response")
  body=$(response_body "$response")
  if [ "$code" = "200" ] || echo "$body" | grep -qi "already exists"; then
    return 0
  fi
  echo "Registration failed for ${username}: ${body:-HTTP ${code}}"
  return 1
}

echo "Registering admin account (${ADMIN_EMAIL})..."
register "$ADMIN_USERNAME" "$ADMIN_EMAIL" "$ADMIN_PASSWORD"

echo "Promoting admin account to ADMIN role..."
docker exec postgres psql -U postgres -d swiftlogistics -c \
  "UPDATE users SET role='ADMIN' WHERE email='${ADMIN_EMAIL}';" > /dev/null 2>&1 \
  || echo "  (couldn't reach the postgres container directly - promote it manually if needed: UPDATE users SET role='ADMIN' WHERE email='${ADMIN_EMAIL}';)"

echo "Registering client account (${CLIENT_EMAIL})..."
register "$CLIENT_USERNAME" "$CLIENT_EMAIL" "$CLIENT_PASSWORD"

echo "Logging in as ${ADMIN_USERNAME} for secured driver account seeding..."
ADMIN_LOGIN_RESPONSE=$(request_json "POST" "${API_BASE}/api/auth/login" "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}")
ADMIN_LOGIN_BODY=$(response_body "$ADMIN_LOGIN_RESPONSE")
ADMIN_LOGIN_CODE=$(response_code "$ADMIN_LOGIN_RESPONSE")
ADMIN_TOKEN=$(json_field "$ADMIN_LOGIN_BODY" "token")
ADMIN_ROLE=$(json_field "$ADMIN_LOGIN_BODY" "role")

if [ "$ADMIN_LOGIN_CODE" != "200" ] || [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_ROLE" != "ADMIN" ]; then
  echo "Could not log in as an ADMIN account for driver seeding."
  exit 1
fi

driver_seed_failures=0

register_driver() {
  local driver_id="$1" email="$2"
  local response code body login_response login_body login_code role username
  response=$(request_json "POST" "${API_BASE}/api/auth/register-driver" \
    "{\"driverId\":\"${driver_id}\",\"email\":\"${email}\",\"password\":\"${DEMO_DRIVER_PASSWORD}\"}" \
    "Authorization: Bearer ${ADMIN_TOKEN}")
  code=$(response_code "$response")
  body=$(response_body "$response")

  if [ "$code" = "200" ]; then
    echo "  Prepared driver login ${driver_id}"
  elif echo "$body" | grep -qi "already exists"; then
    echo "  Driver login ${driver_id} already exists; verifying credentials"
  else
    echo "  Failed to prepare driver login ${driver_id}: ${body:-HTTP ${code}}"
    driver_seed_failures=$((driver_seed_failures + 1))
    return
  fi

  login_response=$(request_json "POST" "${API_BASE}/api/auth/login" "{\"username\":\"${driver_id}\",\"password\":\"${DEMO_DRIVER_PASSWORD}\"}")
  login_code=$(response_code "$login_response")
  login_body=$(response_body "$login_response")
  role=$(json_field "$login_body" "role")
  username=$(json_field "$login_body" "username")

  if [ "$login_code" = "200" ] && [ "$role" = "DRIVER" ] && [ "$username" = "$driver_id" ]; then
    echo "  Verified ${driver_id} logs in as DRIVER"
  else
    echo "  ${driver_id} did not verify as a DRIVER login"
    driver_seed_failures=$((driver_seed_failures + 1))
  fi
}

echo "Creating/verifying demo login accounts for built-in ROS drivers (DRV-01..DRV-05)..."
register_driver "DRV-01" "drv-01@swiftlogistics.com"
register_driver "DRV-02" "drv-02@swiftlogistics.com"
register_driver "DRV-03" "drv-03@swiftlogistics.com"
register_driver "DRV-04" "drv-04@swiftlogistics.com"
register_driver "DRV-05" "drv-05@swiftlogistics.com"

if [ "$driver_seed_failures" -gt 0 ]; then
  echo "Driver seeding failed for ${driver_seed_failures} account(s)."
  exit 1
fi

echo "Logging in as ${CLIENT_USERNAME}..."
LOGIN_RESPONSE=$(request_json "POST" "${API_BASE}/api/auth/login" "{\"username\":\"${CLIENT_USERNAME}\",\"password\":\"${CLIENT_PASSWORD}\"}")
LOGIN_BODY=$(response_body "$LOGIN_RESPONSE")
LOGIN_CODE=$(response_code "$LOGIN_RESPONSE")
TOKEN=$(json_field "$LOGIN_BODY" "token")

if [ "$LOGIN_CODE" != "200" ] || [ -z "$TOKEN" ]; then
  echo "Could not log in as ${CLIENT_USERNAME}."
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
echo "  Demo Drivers -> usernames: DRV-01, DRV-02, DRV-03, DRV-04, DRV-05  password: ${DEMO_DRIVER_PASSWORD}"
echo ""
echo "Check the admin Route Optimization tab - the 7 orders above should already show up"
echo "as 2-3 clustered multi-stop routes (drivers/vehicles are seeded automatically by"
echo "ROS_Adapter on every startup, no extra step needed for those)."
