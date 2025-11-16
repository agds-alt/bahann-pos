# 🧪 End-to-End Payment System Test Guide

**Last Updated**: 2025-11-16
**Build**: e633970
**Status**: ✅ Ready for Testing

---

## 📋 Pre-Test Checklist

Before starting the test, ensure:
- [ ] Dev server is running (`npm run dev`)
- [ ] Database is accessible (Supabase)
- [ ] You are logged in to the POS system
- [ ] At least one outlet exists
- [ ] At least one product exists with stock
- [ ] Browser console is open (for debugging)

---

## 🎯 Test Scenario 1: QRIS Payment Flow

### Step 1: Create Transaction
```
URL: http://localhost:3000/pos/sales

Actions:
1. Select an outlet from dropdown
2. Add product to cart (select product, quantity, click Add)
3. Verify cart shows items correctly
4. Note the cart total amount
```

**Expected Result**:
- ✅ Cart displays items
- ✅ Total amount calculated correctly
- ✅ "Complete Sale" button is enabled

### Step 2: Select QRIS Payment Method
```
Actions:
1. Scroll to payment section (right sidebar)
2. Change payment method from "Cash" to "QRIS" in dropdown
3. Click "Complete Sale" button (or press F8)
```

**Expected Result**:
- ✅ PaymentModal opens
- ✅ Payment method selector shows all 6 methods
- ✅ QRIS is highlighted/selected

### Step 3: View QRIS Details
```
Actions:
1. Click "Lanjut ke QRIS" button
2. Observe the QRIS display
```

**Expected Result**:
- ✅ QR code image displayed
- ✅ Transaction amount shown
- ✅ Transaction ID displayed
- ✅ Countdown timer visible
- ✅ Payment instructions (6 steps) shown
- ✅ Supported apps displayed (GoPay, OVO, Dana, etc.)
- ✅ Download QR button works

**Database Check**:
```sql
-- Check payment record created
SELECT * FROM payments
WHERE transaction_id LIKE '%'
ORDER BY created_at DESC
LIMIT 1;

-- Should show:
-- status: 'pending'
-- payment_method_id: (QRIS method ID)
-- qris_content: (QRIS string)
-- amount: (cart total)
```

### Step 4: Confirm Payment
```
Actions:
1. Click "Sudah Bayar - Konfirmasi" button
2. Observe the result
```

**Expected Result**:
- ✅ Modal closes
- ✅ Success message appears
- ✅ Print preview modal opens with receipt
- ✅ Cart is cleared
- ✅ Form is reset

**Database Check**:
```sql
-- Check payment confirmed
SELECT * FROM payments
WHERE id = '[payment_id_from_step3]';

-- Should show:
-- status: 'paid'
-- confirmed_at: (timestamp)
-- confirmed_by: (user ID)

-- Check payment confirmation record
SELECT * FROM payment_confirmations
WHERE payment_id = '[payment_id_from_step3]';

-- Should show:
-- action: 'confirmed'
-- performed_by: (user ID)
-- created_at: (timestamp)

-- Check transaction created
SELECT * FROM sales_transactions
WHERE notes LIKE '%Payment ID:%';

-- Should include payment ID in notes
```

### Step 5: Verify Receipt
```
Actions:
1. Check receipt in print preview
2. Verify all details
```

**Expected Result**:
- ✅ Transaction ID matches
- ✅ Items listed correctly
- ✅ Amount matches
- ✅ Payment method shows "qris"
- ✅ Notes include payment ID

---

## 🎯 Test Scenario 2: Bank Transfer Payment Flow

### Step 1: Create Transaction
```
Same as QRIS Scenario Step 1
```

### Step 2: Select Bank Transfer
```
Actions:
1. Change payment method to "Bank Transfer"
2. Click "Complete Sale"
```

**Expected Result**:
- ✅ PaymentModal opens
- ✅ Bank Transfer is selected

### Step 3: View Bank Transfer Details
```
Actions:
1. Click "Lanjut ke Transfer Bank" button
2. Observe the bank details display
```

**Expected Result**:
- ✅ Bank card displayed with gradient design
- ✅ Bank name shown
- ✅ Account number displayed
- ✅ Account holder name shown
- ✅ Copy buttons work (account number & amount)
- ✅ Transfer amount highlighted
- ✅ Transaction ID shown
- ✅ Countdown timer visible
- ✅ Transfer instructions (9 steps) shown
- ✅ Important notices displayed

### Step 4: Test Copy Functionality
```
Actions:
1. Click "📋 Copy" next to account number
2. Paste in notepad/console
3. Click "📋 Copy" next to amount
4. Paste in notepad/console
```

**Expected Result**:
- ✅ Account number copied correctly
- ✅ Amount copied correctly
- ✅ "✓ Copied" feedback shown

### Step 5: Confirm Payment
```
Same as QRIS Scenario Step 4
```

---

## 🎯 Test Scenario 3: Cash Payment (Existing Flow)

### Test Cash Still Works
```
Actions:
1. Add items to cart
2. Select payment method: "Cash"
3. Enter amount paid >= cart total
4. Click "Complete Sale"
```

**Expected Result**:
- ✅ PaymentModal does NOT open
- ✅ Transaction recorded immediately
- ✅ Print preview opens
- ✅ Receipt generated
- ✅ Cart cleared

**Database Check**:
```sql
-- Transaction should be created without payment table entry
SELECT * FROM sales_transactions
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🎯 Test Scenario 4: Error Handling

### Test 4.1: Empty Cart
```
Actions:
1. Clear cart (if not empty)
2. Click "Complete Sale"
```

**Expected Result**:
- ✅ Error: "Keranjang kosong..."
- ✅ Modal does not open

### Test 4.2: No Outlet Selected
```
Actions:
1. Add items to cart
2. Clear outlet selection
3. Click "Complete Sale"
```

**Expected Result**:
- ✅ Error: "Silakan pilih outlet"
- ✅ Modal does not open

### Test 4.3: Cancel Payment
```
Actions:
1. Add items to cart
2. Select QRIS/Bank Transfer
3. Click "Complete Sale"
4. In PaymentModal, click "Batal" or "✕" (close)
```

**Expected Result**:
- ✅ Modal closes
- ✅ Cart remains intact
- ✅ Can retry payment

### Test 4.4: Payment Method Database Error
```
Actions:
1. Stop Supabase connection (or simulate error)
2. Try to complete sale with QRIS
```

**Expected Result**:
- ✅ Error message shown
- ✅ Modal handles gracefully

---

## 🎯 Test Scenario 5: Multiple Payment Methods

### Test All Methods
```
For each payment method:
- Cash ✅
- QRIS ✅
- Bank Transfer ✅
- Debit Card ✅
- Credit Card ✅
- E-Wallet (Manual) ✅

Actions:
1. Add items to cart
2. Select payment method
3. Complete transaction
4. Verify correct flow
```

**Expected Results**:
- Cash/Debit/Credit → Instant flow (no modal)
- QRIS → Show QRIS modal
- Bank Transfer → Show bank details modal
- E-Wallet → Show bank details modal (manual confirmation)

---

## 🎯 Test Scenario 6: Browser Console Checks

### Check for Errors
```javascript
// Open browser console (F12)
// Look for:

✅ No red errors
✅ QRIS generation logs
✅ Payment creation logs
✅ Transaction creation logs

// Expected logs:
"🔄 Starting sync..."
"📡 Network restored - starting sync"
"✅ QRIS Generated Successfully!"
"✅ Payment Methods Retrieved!"
```

### Test Functions Available
```javascript
// In console (on http://localhost:3000/test-payment.html):
await generateQRISImage({
  merchantName: 'Test Merchant',
  merchantCity: 'Jakarta',
  amount: 50000
})

await getActivePaymentMethods()
```

---

## 📊 Database Verification Queries

### Check Payment Methods
```sql
SELECT id, code, name, type, is_active
FROM payment_methods
ORDER BY display_order;

-- Expected: 6 active payment methods
```

### Check Payments Table
```sql
SELECT
  id,
  transaction_id,
  amount,
  status,
  created_at,
  confirmed_at
FROM payments
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Check Payment Confirmations
```sql
SELECT
  pc.*,
  p.transaction_id,
  p.amount
FROM payment_confirmations pc
JOIN payments p ON p.id = pc.payment_id
WHERE pc.created_at > NOW() - INTERVAL '1 hour'
ORDER BY pc.created_at DESC;
```

### Check Sales Transactions with Payments
```sql
SELECT
  st.id,
  st.transaction_id,
  st.total,
  st.payment_method,
  st.notes
FROM sales_transactions st
WHERE st.notes LIKE '%Payment ID:%'
  AND st.created_at > NOW() - INTERVAL '1 hour'
ORDER BY st.created_at DESC;
```

---

## 🐛 Known Issues & Troubleshooting

### Issue 1: PaymentModal Not Opening
**Symptoms**: Click "Complete Sale" but modal doesn't open

**Checks**:
1. Payment method is QRIS/Bank Transfer?
2. Console shows errors?
3. Check `isPaymentModalOpen` state
4. Check import: `import { PaymentModal } from '@/components/payment'`

**Fix**: Hard refresh browser (Ctrl+Shift+R)

### Issue 2: QRIS Not Generating
**Symptoms**: Modal opens but shows error

**Checks**:
1. Check console for QRIS generation errors
2. Verify payment_methods table has QRIS method
3. Check account_details JSON is valid

**Test**:
```javascript
// In browser console:
import { generateQRISImage } from '/src/lib/payment/qris-generator.js'
await generateQRISImage({ merchantName: 'Test', merchantCity: 'Jakarta', amount: 50000 })
```

### Issue 3: Database Connection Error
**Symptoms**: "Failed to create payment" error

**Checks**:
1. Supabase connection active?
2. Check .env.local has correct credentials
3. Verify tables exist

**Test**:
```bash
curl -X GET "https://skdgytedoilnlflyjvbc.supabase.co/rest/v1/payment_methods?select=*" \
  -H "apikey: [YOUR_ANON_KEY]"
```

### Issue 4: Payment Not Confirming
**Symptoms**: Click confirm but nothing happens

**Checks**:
1. Check user ID is valid (getUserId())
2. Check network tab for API errors
3. Verify payment status is 'pending'

---

## ✅ Test Completion Checklist

After completing all tests, verify:

- [ ] QRIS payment creates payment record
- [ ] QRIS QR code displays correctly
- [ ] QRIS countdown timer works
- [ ] QRIS payment can be confirmed
- [ ] Bank transfer details display correctly
- [ ] Bank transfer copy buttons work
- [ ] Bank transfer payment can be confirmed
- [ ] Cash payment works without modal
- [ ] Empty cart shows error
- [ ] No outlet shows error
- [ ] Cancel payment keeps cart intact
- [ ] Receipt generated after payment
- [ ] Database records created correctly
- [ ] Payment confirmations logged
- [ ] No console errors
- [ ] All payment methods work

---

## 📝 Test Report Template

```markdown
# Payment System Test Report

**Date**: [YYYY-MM-DD]
**Tester**: [Your Name]
**Build**: e633970

## Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. QRIS Payment | ✅/❌ | |
| 2. Bank Transfer | ✅/❌ | |
| 3. Cash Payment | ✅/❌ | |
| 4. Error Handling | ✅/❌ | |
| 5. Multiple Methods | ✅/❌ | |
| 6. Console Checks | ✅/❌ | |

## Issues Found

1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce:
   - Expected vs Actual:

## Database Verification

- [ ] Payment records created: ✅/❌
- [ ] Confirmations logged: ✅/❌
- [ ] Transactions linked: ✅/❌

## Recommendation

[ ] PASS - Ready for production
[ ] CONDITIONAL PASS - Minor fixes needed
[ ] FAIL - Critical issues found
```

---

## 🚀 Next Steps After Testing

If all tests pass:
1. Mark payment system as production-ready
2. Document any edge cases found
3. Update user training materials
4. Plan Phase 2 features:
   - WhatsApp notifications
   - Payment proof upload
   - Payment dashboard
   - Advanced reporting

---

**Happy Testing!** 🧪✨

Generated with Claude Code
Build: e633970
