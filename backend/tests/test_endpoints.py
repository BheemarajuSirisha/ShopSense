import uuid
import pytest
from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_vendor_crud_and_duplicate_email(client: TestClient):
    # 1. Create a unique vendor
    unique_email = f"test_artisan_{uuid.uuid4().hex[:8]}@shopsense.com"
    payload = {
        "business_name": "Test Artisan Studio",
        "owner_name": "Test Owner",
        "email": unique_email,
        "phone": "+1 (555) 019-2834",
        "category": "Home & Living",
        "status": "pending",
    }
    create_res = client.post("/vendors", json=payload)
    assert create_res.status_code == 201
    created_vendor = create_res.json()
    vendor_id = created_vendor["vendor_id"]
    assert created_vendor["business_name"] == "Test Artisan Studio"
    assert created_vendor["status"] == "pending"

    # 2. Reject duplicate email with 409 Conflict
    dup_res = client.post("/vendors", json=payload)
    assert dup_res.status_code == 409
    assert "already exists" in dup_res.json()["detail"]["message"].lower()

    # 3. Read vendor by ID
    get_res = client.get(f"/vendors/{vendor_id}")
    assert get_res.status_code == 200
    assert get_res.json()["email"] == unique_email

    # 4. Update vendor details
    update_payload = {"business_name": "Updated Artisan Studio"}
    put_res = client.put(f"/vendors/{vendor_id}", json=update_payload)
    assert put_res.status_code == 200
    assert put_res.json()["business_name"] == "Updated Artisan Studio"

    # 5. Patch status to 'active'
    status_res = client.patch(f"/vendors/{vendor_id}/status", json={"status": "active"})
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "active"

    # 6. List vendors filter by status
    list_res = client.get("/vendors?status=active")
    assert list_res.status_code == 200
    active_vendors = list_res.json()
    assert any(v["vendor_id"] == vendor_id for v in active_vendors)


def test_product_crud_and_vendor_validation(client: TestClient):
    # 1. Reject product creation if vendor does not exist (404)
    bad_product = {
        "product_name": "Ghost Item",
        "category": "Electronics",
        "price": 99.99,
        "stock": 10,
        "vendor_id": 999999,  # Non-existent
    }
    bad_res = client.post("/products", json=bad_product)
    assert bad_res.status_code == 404

    # 2. Fetch an existing active vendor
    vendors_res = client.get("/vendors")
    assert vendors_res.status_code == 200
    vendors = vendors_res.json()
    assert len(vendors) > 0
    valid_vendor_id = vendors[0]["vendor_id"]

    # 3. Create a valid product
    good_product = {
        "product_name": "Handmade Ceramic Mug",
        "category": "Home & Living",
        "price": 34.50,
        "stock": 25,
        "vendor_id": valid_vendor_id,
        "warehouse": "Central Warehouse",
        "reorder_level": 10,
    }
    prod_res = client.post("/products", json=good_product)
    assert prod_res.status_code == 201
    prod_data = prod_res.json()
    product_id = prod_data["product_id"]
    assert prod_data["product_name"] == "Handmade Ceramic Mug"

    # 4. Verify inventory record was automatically created
    inv_res = client.get("/inventory")
    assert inv_res.status_code == 200
    inv_items = inv_res.json()
    matching_inv = next((i for i in inv_items if i["product_id"] == product_id), None)
    assert matching_inv is not None
    assert matching_inv["current_stock"] == 25

    # 5. Update product price and stock
    update_res = client.put(f"/products/{product_id}", json={"stock": 5, "price": 39.99})
    assert update_res.status_code == 200
    assert update_res.json()["stock"] == 5

    # 6. Delete product
    del_res = client.delete(f"/products/{product_id}")
    assert del_res.status_code == 200


def test_inventory_endpoints(client: TestClient):
    # 1. Fetch inventory
    inv_res = client.get("/inventory")
    assert inv_res.status_code == 200
    items = inv_res.json()
    assert isinstance(items, list)
    assert len(items) > 0

    # 2. Filter low-stock
    low_res = client.get("/inventory?low_stock=true")
    assert low_res.status_code == 200
    low_items = low_res.json()
    for item in low_items:
        assert item["current_stock"] <= item["reorder_level"]
        assert item["is_low_stock"] is True

    # 3. Update inventory restock
    test_inv = items[0]
    inv_id = test_inv["inventory_id"]
    put_res = client.put(f"/inventory/{inv_id}", json={"current_stock": 100, "reorder_level": 20})
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["current_stock"] == 100
    assert updated["reorder_level"] == 20


def test_analytics_endpoints(client: TestClient):
    # 1. Revenue KPI summary
    rev_res = client.get("/analytics/revenue")
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert "total_revenue" in rev_data
    assert "total_orders" in rev_data
    assert "average_order_value" in rev_data
    assert rev_data["total_revenue"] > 0
    assert rev_data["total_orders"] > 0

    # 2. Vendor revenue
    v_rev_res = client.get("/analytics/vendor-revenue")
    assert v_rev_res.status_code == 200
    v_items = v_rev_res.json()
    assert len(v_items) > 0
    assert "share_percentage" in v_items[0]

    # 3. Product revenue
    p_rev_res = client.get("/analytics/product-revenue")
    assert p_rev_res.status_code == 200
    assert len(p_rev_res.json()) > 0

    # 4. Top products
    top_res = client.get("/analytics/top-product?limit=5")
    assert top_res.status_code == 200
    top_items = top_res.json()
    assert len(top_items) <= 5

    # 5. Monthly trend
    trend_res = client.get("/analytics/monthly-trend")
    assert trend_res.status_code == 200
    trends = trend_res.json()
    assert len(trends) > 0
    assert "month_label" in trends[0]
    assert "revenue" in trends[0]

    # 6. Category revenue
    cat_res = client.get("/analytics/category-revenue")
    assert cat_res.status_code == 200
    cats = cat_res.json()
    assert len(cats) > 0
    assert "percentage" in cats[0]


def test_transaction_endpoints(client: TestClient):
    # 1. Fetch products to get a valid product and vendor pair
    products_res = client.get("/products?limit=1")
    assert products_res.status_code == 200
    products = products_res.json()
    assert len(products) > 0
    target_product = products[0]
    prod_id = target_product["product_id"]
    vend_id = target_product["vendor_id"]

    # 2. List transactions
    txn_list_res = client.get("/transactions?limit=10")
    assert txn_list_res.status_code == 200
    txns = txn_list_res.json()
    assert isinstance(txns, list)

    # 3. Create a transaction
    new_txn_payload = {
        "product_id": prod_id,
        "vendor_id": vend_id,
        "quantity": 2,
        "amount": round(target_product["price"] * 2, 2)
    }
    create_res = client.post("/transactions", json=new_txn_payload)
    assert create_res.status_code == 201
    created_txn = create_res.json()
    assert created_txn["product_id"] == prod_id
    assert created_txn["vendor_id"] == vend_id
    assert created_txn["quantity"] == 2
    assert "transaction_id" in created_txn
    txn_id = created_txn["transaction_id"]

    # 4. Get by ID
    get_res = client.get(f"/transactions/{txn_id}")
    assert get_res.status_code == 200
    assert get_res.json()["transaction_id"] == txn_id

    # 5. Reject invalid product or vendor mismatch
    bad_payload = {
        "product_id": prod_id,
        "vendor_id": 999999,
        "quantity": 1,
        "amount": 50.0
    }
    bad_res = client.post("/transactions", json=bad_payload)
    assert bad_res.status_code == 400
