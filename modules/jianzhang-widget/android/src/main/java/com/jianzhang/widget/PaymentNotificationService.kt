package com.jianzhang.widget
import android.app.Notification
import android.content.Context
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import org.json.JSONObject
class PaymentNotificationService:NotificationListenerService(){
 override fun onNotificationPosted(notification:StatusBarNotification){
  val prefs=getSharedPreferences("jianzhang_widget",Context.MODE_PRIVATE)
  if(!prefs.getBoolean("capture_payments",false)||notification.packageName !in setOf("com.tencent.mm","com.eg.android.AlipayGphone"))return
  val extras=notification.notification.extras
  val text=(extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()+" "+(extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?:extras.getCharSequence(Notification.EXTRA_TEXT))?.toString().orEmpty()).take(500)
  if(!Regex("支付成功|付款成功|消费|收款|到账").containsMatchIn(text))return
  val match=Regex("(?:[¥￥]\\s*(\\d{1,9}(?:\\.\\d{1,2})?)|(\\d{1,9}(?:\\.\\d{1,2})?)\\s*元)").find(text)?:return
  val amount=match.groupValues[1].ifBlank{match.groupValues[2]};if(amount.toBigDecimalOrNull()?.signum()!=1)return
  val id=notification.key
  val old=try{JSONArray(prefs.getString("payment_drafts","[]")?:"[]")}catch(_:Exception){JSONArray()}
  val next=JSONArray();for(i in maxOf(0,old.length()-19) until old.length())if(old.getJSONObject(i).optString("id")!=id&&next.length()<19)next.put(old.getJSONObject(i))
  val date=java.text.SimpleDateFormat("yyyy-MM-dd",java.util.Locale.ROOT).format(java.util.Date(notification.postTime))
  next.put(JSONObject().put("id",id).put("amount",amount).put("text",text).put("date",date).put("type",if(Regex("收款|到账").containsMatchIn(text))2 else 1))
  prefs.edit().putString("payment_drafts",next.toString()).apply()
 }
}
