from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter()


@router.post("/bills", response_model=schemas.BillResponse, status_code=201)
def create_bill(bill: schemas.BillCreate, db: Session = Depends(get_db)):
    db_bill = models.Bill(**bill.model_dump())
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill


@router.get("/bills", response_model=List[schemas.BillResponse])
def list_bills(db: Session = Depends(get_db)):
    return (
        db.query(models.Bill)
        .order_by(models.Bill.created_at.desc())
        .all()
    )


@router.get("/bills/{bill_id}", response_model=schemas.BillResponse)
def get_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.delete("/bills/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    db.delete(bill)
    db.commit()
    return {"ok": True}


@router.put("/bills/{bill_id}", response_model=schemas.BillResponse)
def update_bill(bill_id: int, bill_update: schemas.BillCreate, db: Session = Depends(get_db)):
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Update all fields provided
    for key, value in bill_update.model_dump().items():
        setattr(db_bill, key, value)
        
    db.commit()
    db.refresh(db_bill)
    return db_bill

