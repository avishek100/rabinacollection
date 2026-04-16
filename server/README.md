# Rabina Closet Server

MongoDB-backed API for the Rabina Closet frontend.

## Scripts

- `npm run dev` starts the API in watch mode
- `npm start` starts the API normally

## Environment

Copy `server/.env.example` to `server/.env` and set:

- `PORT`
- `CLIENT_ORIGIN`
- `MONGODB_URI`
- `ADMIN_API_KEY`

## Default URL

- `http://localhost:3001`

## Endpoints

- `GET /api/health`
- `GET /api/store`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/contact`
- `POST /api/newsletter`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
