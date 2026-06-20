from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime


class BillCreate(BaseModel):
    name:        str
    description: Optional[str] = ""
    total:       float
    people:      List[Dict[str, Any]]
    split_mode:  str
    split_data:  Optional[Dict[str, Any]]  = {}
    items:       Optional[List[Dict[str, Any]]] = []
    settlements: Optional[List[Dict[str, Any]]] = []


class BillResponse(BillCreate):
    id:         int
    created_at: datetime

    model_config = {"from_attributes": True}
