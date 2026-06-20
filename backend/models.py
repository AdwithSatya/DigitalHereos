from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class Bill(Base):
    __tablename__ = "bills"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String,  nullable=False)
    description = Column(String,  default="")
    total       = Column(Float,   nullable=False)
    people      = Column(JSON,    nullable=False)   # [{id, name, paid}]
    split_mode  = Column(String,  nullable=False)
    split_data  = Column(JSON,    default={})
    items       = Column(JSON,    default=[])
    settlements = Column(JSON,    default=[])
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
