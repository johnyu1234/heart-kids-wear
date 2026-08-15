from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.product import Category
from backend.app.schemas.product import CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def get_category_tree(db: Session = Depends(get_db)):
    # Return all top-level categories with eager loaded children
    top_categories = (
        db.query(Category)
        .filter(Category.parent_id == None, Category.is_active == True)
        .order_by(Category.sort_order.asc())
        .all()
    )
    return top_categories
