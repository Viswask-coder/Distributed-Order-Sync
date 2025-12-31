# 🎬 Quick Demo Script (5-Minute Version)

## Setup (Before Demo)
```bash
# Terminal 1
cd server_1 && npm run dev

# Terminal 2  
cd server_2 && npm run dev
```

---

## Demo Flow

### 1️⃣ Introduction (30 seconds)
**Say:** 
> "I've built a distributed order management system where two independent servers automatically sync data with each other. Let me show you how it works."

**Show:** Both terminal windows running

---

### 2️⃣ Register User (1 minute)

**Action:**
```http
POST http://localhost:3000/users
{
  "name": "Demo User",
  "email": "demo@test.com",
  "password": "demo123"
}
```

**Say:** 
> "I'm creating a user on Server 1..."

**Show Database:**
```sql
-- Run on BOTH databases
SELECT * FROM users WHERE email = 'demo@test.com';
```

**Say:** 
> "Notice it's in both databases - automatic sync!"

---

### 3️⃣ Create Order with Auto-Calculation (2 minutes)

**Say:** 
> "Now I'll create an order. Instead of calculating the total manually, I just send product IDs."

**Show Menu:**
```
1. Burger - ₹120
2. Pizza - ₹250  
3. Fries - ₹80
```

**Action:**
```http
POST http://localhost:3000/orders
{
  "user_id": 1,
  "product_ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "amount": 450,
  "products": [
    {"id": 1, "name": "Spicy Burger", "price": 120},
    {"id": 2, "name": "Cheese Pizza", "price": 250},
    {"id": 3, "name": "French Fries", "price": 80}
  ]
}
```

**Say:** 
> "The system calculated: 120 + 250 + 80 = 450 automatically!"

**Show Database:**
```sql
SELECT order_uuid, amount, products, source_server 
FROM orders 
ORDER BY updated_at DESC LIMIT 1;
```

**Say:** 
> "And it's synced to both servers!"

---

### 4️⃣ Bi-directional Sync (1 minute)

**Say:** 
> "Now let me create an order from Server 2..."

**Action:**
```http
POST http://localhost:4000/orders
{
  "user_id": 1,
  "product_ids": [4, 5]
}
```

**Show Database:**
```sql
SELECT order_uuid, source_server, amount 
FROM orders 
ORDER BY updated_at DESC LIMIT 2;
```

**Say:** 
> "See? One from Server_1, one from Server_2, both in both databases!"

---

### 5️⃣ Network Failure Handling (30 seconds)

**Say:** 
> "What if a server goes down?"

**Action:**
1. Stop Server 2 (Ctrl+C)
2. Create order on Server 1
3. Show console: "Attempt 1 failed... Attempt 2 failed... Attempt 3 failed..."

**Show Database:**
```sql
SELECT * FROM failed_syncs ORDER BY created_at DESC LIMIT 1;
```

**Say:** 
> "It tries 3 times, then saves to failed_syncs table for later retry. No data lost!"

---

## Key Points to Emphasize

✅ **Automatic Sync** - No manual intervention needed
✅ **Auto-Calculation** - Reduces human error  
✅ **Fault Tolerant** - Handles network failures
✅ **Bi-directional** - Works both ways
✅ **Conflict Resolution** - Uses timestamps
✅ **Scalable** - Can add more servers

---

## Quick Answers to Common Questions

**Q: What if both servers update same order?**
A: Newer timestamp wins (Last Write Wins strategy)

**Q: What about security?**
A: Can add JWT auth, API keys, HTTPS

**Q: Can it scale to more servers?**
A: Yes! Just configure each server to sync with others

**Q: Performance impact?**
A: Minimal - sync is async, ~100-200ms

**Q: What if database fails?**
A: Error handling + logging, can add retry logic

---

## Files to Have Open in VS Code

1. `server_1/src/services/order_services.js` - Show sync logic
2. `server_1/src/models/order_model.js` - Show product calculation
3. `server_1/.env` - Show configuration
4. `PRESENTATION_GUIDE.md` - Full reference

---

## Database Queries to Bookmark

```sql
-- See all orders
SELECT * FROM orders ORDER BY updated_at DESC;

-- Count by server
SELECT source_server, COUNT(*) FROM orders GROUP BY source_server;

-- See failed syncs
SELECT * FROM failed_syncs;

-- See specific order in both DBs
SELECT * FROM orders WHERE order_uuid = 'xxx';
```

---

## Postman Collection

Save these requests:

1. **Register User** - POST localhost:3000/users
2. **Login** - POST localhost:3000/users/login  
3. **Create Order S1** - POST localhost:3000/orders
4. **Create Order S2** - POST localhost:4000/orders
5. **Update Order** - PUT localhost:3000/orders/{uuid}

---

## Confidence Boosters

✅ You built this from scratch
✅ It actually works
✅ It solves a real problem
✅ The code is clean and organized
✅ You understand every part

**You've got this! 🚀**
