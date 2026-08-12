const {makeId,now}=require('../services/id');

function createPaymentReceiptDeliveryRepository(store){
  if(store.type==='json')return{
    record(tenantId,input){const data=store.read();if(!data.paymentReceiptDeliveries)data.paymentReceiptDeliveries=[];const prior=data.paymentReceiptDeliveries.find(x=>x.tenantId===tenantId&&x.paymentId===input.paymentId);if(prior){Object.assign(prior,input,{updatedAt:now()});store.write(data);return prior;}const row={id:makeId('rcpt'),tenantId,...input,createdAt:now(),updatedAt:now()};data.paymentReceiptDeliveries.push(row);store.write(data);return row;},
    findByPayment(tenantId,paymentId){return(store.read().paymentReceiptDeliveries||[]).find(x=>x.tenantId===tenantId&&x.paymentId===paymentId)||null;}
  };
  return{
    async record(tenantId,input){const result=await store.query(`INSERT INTO payment_receipt_deliveries(tenant_id,payment_id,invoice_id,customer_id,recipient,status,provider_message_id,error_code,error_message) VALUES($1,$2::uuid,$3::uuid,NULLIF($4,'')::uuid,$5,$6,$7,$8,$9) ON CONFLICT(tenant_id,payment_id) DO UPDATE SET status=EXCLUDED.status,provider_message_id=EXCLUDED.provider_message_id,error_code=EXCLUDED.error_code,error_message=EXCLUDED.error_message,updated_at=now() RETURNING id::text,tenant_id AS "tenantId",payment_id::text AS "paymentId",invoice_id::text AS "invoiceId",customer_id::text AS "customerId",recipient,status,provider_message_id AS "providerMessageId",error_code AS "errorCode",error_message AS "errorMessage",created_at AS "createdAt",updated_at AS "updatedAt"`,[tenantId,input.paymentId,input.invoiceId,input.customerId||'',input.recipient||'',input.status,input.providerMessageId||'',input.errorCode||'',input.errorMessage||'']);return result.rows[0];},
    async findByPayment(tenantId,paymentId){const result=await store.query(`SELECT id::text,tenant_id AS "tenantId",payment_id::text AS "paymentId",invoice_id::text AS "invoiceId",customer_id::text AS "customerId",recipient,status,provider_message_id AS "providerMessageId",error_code AS "errorCode",error_message AS "errorMessage",created_at AS "createdAt",updated_at AS "updatedAt" FROM payment_receipt_deliveries WHERE tenant_id=$1 AND payment_id=$2 LIMIT 1`,[tenantId,paymentId]);return result.rows[0]||null;}
  };
}
module.exports={createPaymentReceiptDeliveryRepository};
