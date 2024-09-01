# Simple Ticket Checkout

This is a simple ticket checkout system to pay with SATS.

It use Lightning Network to pay tickets, NOSTR to comunication, Sendy to mailing service and SQLite to database.

# Getting Started

1. Copy the `.env.example` file to `.env` and fill in the required values.

```bash
cp .env.example .env
```

2. Install dependencies

```bash
pnmp install
```

3. Use the correct node version

```bash
nvm use
```

4. Create database

```bash
pnpm prisma migrate dev --init
```

5. Start the server

```bash
pnpm dev
```

# Endpoints

## Create a new ticket

`your_ticketing_domain/api/ticket/request`

- Create user in the database (If the email is not already in the database)
- Create a new ticket in the database
- Add email to Sendy list (Subscribed or not to newsletter)

### Parameters:

```json
{
    "fullname": <string>,
    "email": <string>,
    "qty": <number>,
    "isSubscribed": <boolean>
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
		"pr": <string, invoice to pay>,
		"orderReferenceId": <64-character lowercase hex value, tag e of zap request>,
		"qty": <number, quantity of orders>,
		"totalMiliSats": <number, total to pay in mili sats>
	}
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <array of json objects, each one object describe one error>
}
```

## Claim ticket

`your_ticketing_domain/api/ticket/claim`

- Check if the invoice is paid
- Update database to mark the ticket as paid

### Parameters:

```json
{
    "fullname": <string>,
    "email": <string>,
    "zapReceipt": <json object zap receipt nostr event>,
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
		"fullname": <string>,
		"email": <string>,
		"orderReferenceId": <64-character lowercase hex value>,
		"qty": <number>,
		"totalMiliSats": <number>
	}
}
```

## Get orders

`your_ticketing_domain/api/ticket/orders`

- Validate if you are an authorized admin

### Parameters:

> Signed Nostr Event with your admin key

```json
{
  "id": <32-bytes lowercase hex-encoded sha256 of the serialized event data>,
  "pubkey": <32-bytes lowercase hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": 27242,
  "tags": [],
  "content": <string>,
  "sig":  <64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data>
}
```

Content:

```json
{
  "limit": <number, 0 for all or specify te quantity>,
  "checked_in": <boolean, optional, not passed means both>
  "ticket_id": <string, optional, not passed means all orders>
  "email":  <string, optional, not passed means all orders>
}
```

> You can combine that you prefer. ei. all orders checked in of X email, only order with X ticket ID.

### Response:

#### Valid

Data is an array of objects with order information.

```json
{
	"status": <boolean>,
	"data": [
		{
			"user": {
				"fullname": <string>,
				"email": <string>
			},
			"ticketId": <string>,
			"qty": <number>,
			"totalMiliSats": <number>,
			"paid": <boolean>,
			"checkIn": <boolean>
		},
		...
	]
}
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <string>
}
```

## Check In Order

`your_ticketing_domain/api/ticket/checkin`

- Validate if you are an authorized admin
- Check if the order is paid and check in

### Parameters:

> Signed Nostr Event with your admin key

```json
{
  "id": <32-bytes lowercase hex-encoded sha256 of the serialized event data>,
  "pubkey": <32-bytes lowercase hex-encoded public key of the event creator>,
  "created_at": <unix timestamp in seconds>,
  "kind": 27242,
  "tags": [],
  "content": <string>,
  "sig":  <64-bytes lowercase hex of the signature of the sha256 hash of the serialized event data>
}
```

Content:

```json
{
  "ticket_id": <string>,
}
```

### Response:

#### Valid

```json
{
	"status": <boolean>,
	"data": {
      "alreadyCheckedIn": <boolean, true if the order already checked>,
       "order": {
      "id": <string, UUID format,
      "referenceId": <64-bytes lowercase hex-encoded string>,
      "ticketId": <16-bytes lowercase hex-encoded string>",
      "qty": <number>,
      "totalMiliSats": <number>,
      "paid": <boolean>,
      "checkIn": <boolean, true if the order has been checked in>,
      "zapReceiptId": <64-bytes lowercase hex-encoded string>,
      "userId": <string, UUID format>
    },
    "user": {
      "id": <string, UUID format>,
      "fullname": <string>,
      "email": <string>
    }
```

#### Invalid

```json
{
	"status": <boolean>,
	"errors": <string>
}
```
