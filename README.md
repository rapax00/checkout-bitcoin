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

## Parameters:

```json
{
    "fullname": <string>,
    "email": <string>,
    "qty": <number>,
    "isSubscribed": <boolean>
}
```

## Response:

### Valid

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

### Invalid

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

## Parameters:

```json
{
    "fullname": <string>,
    "email": <string>,
    "zapReceipt": <json object zap receipt nostr event>,
}
```

## Response:

### Valid

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
