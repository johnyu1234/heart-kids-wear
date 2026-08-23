from typing import List
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.product import Category
from backend.app.schemas.product import CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])

# Simple in-memory cache for categories (60s TTL) to eliminate database round-trips
_category_cache = {
    "data": None,
    "timestamp": 0
}

@router.get("", response_model=List[CategoryOut])
def get_category_tree(db: Session = Depends(get_db)):
    global _category_cache
    now = time.time()

    # Serve from memory if cached within 60 seconds
    if _category_cache["data"] is not None and (now - _category_cache["timestamp"]) < 60:
        return _category_cache["data"]

    # Eager load children with joinedload to eliminate N+1 queries
    top_categories = (
        db.query(Category)
        .options(joinedload(Category.children))
        .filter(Category.parent_id == None, Category.is_active == True)
        .order_by(Category.sort_order.asc())
        .all()
    )

    _category_cache["data"] = top_categories
    _category_cache["timestamp"] = now
    return top_categories
