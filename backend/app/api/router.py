from fastapi import APIRouter
from backend.app.api import (
    auth, members, categories, products,
    wishlist, cart, checkout, orders, messages
)
from backend.app.api.admin import (
    products as admin_products,
    orders as admin_orders,
    members as admin_members,
    messages as admin_messages,
    finance as admin_finance
)

api_router = APIRouter()

# Customer Routes
api_router.include_router(auth.router)
api_router.include_router(members.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(wishlist.router)
api_router.include_router(cart.router)
api_router.include_router(checkout.router)
api_router.include_router(orders.router)
api_router.include_router(messages.router)

# Admin Routes
api_router.include_router(admin_products.router)
api_router.include_router(admin_orders.router)
api_router.include_router(admin_members.router)
api_router.include_router(admin_messages.router)
api_router.include_router(admin_finance.router)
